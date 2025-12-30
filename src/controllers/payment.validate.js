import PaymentLink from "../model/PaymentLink.js";
import Invoice from "../model/Invoice.js";

export const validatePaymentLink = async (req, res) => {
  try {
    const { token } = req.params;

    const link = await PaymentLink.findOne({ token });
    if (!link) return res.status(400).json({ message: "Invalid link" });

    if (link.status !== "PENDING")
      return res.status(400).json({ message: "Link expired or used" });

    if (link.expiresAt < new Date()) {
      link.status = "EXPIRED";
      await link.save();
      return res.status(400).json({ message: "Link expired" });
    }

    const invoice = await Invoice.findById(link.invoiceId);
    if (invoice.status !== "paid") {
      invoice.status = "pending";
      await invoice.save();
    }
    res.json({ invoice });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};