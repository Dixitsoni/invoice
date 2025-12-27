import Invoice from "../model/Invoice.js";

// Stripe
export const syncStripePayment = async (req, res) => {
  try {
    const { invoiceId, status, paymentIntentId } = req.body;
    if (!invoiceId || !status) return res.status(400).json({ success: false, message: "Missing data" });

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });

    invoice.status = status === "paid" ? "paid" : status;
    invoice.paymentDetails = { paymentIntentId };
    await invoice.save();

    res.json({ success: true, message: "Stripe payment synced" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Razorpay
export const syncRazorpayPayment = async (req, res) => {
  try {
    const { invoiceId, status, razorpayPaymentId } = req.body;
    if (!invoiceId || !status) return res.status(400).json({ success: false, message: "Missing data" });

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });

    invoice.status = status === "paid" ? "paid" : status;
    invoice.paymentDetails = { razorpayPaymentId };
    await invoice.save();

    res.json({ success: true, message: "Razorpay payment synced" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PayPal
export const syncPayPalPayment = async (req, res) => {
  try {
    const { invoiceId, status, paypalOrderId } = req.body;
    if (!invoiceId || !status) return res.status(400).json({ success: false, message: "Missing data" });

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });

    invoice.status = status === "completed" ? "paid" : status;
    invoice.paymentDetails = { paypalOrderId };
    await invoice.save();

    res.json({ success: true, message: "PayPal payment synced" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
