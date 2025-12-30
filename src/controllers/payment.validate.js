import PaymentLink from "../model/PaymentLink.js";
import Invoice from "../model/Invoice.js";

export const validatePaymentLink = async (token) => {
  const link = await PaymentLink.findOne({ token });

  if (!link) throw new Error("Invalid payment link");
  if (link.status !== "PENDING") throw new Error("Link already used");
  if (link.expiresAt < new Date()) {
    link.status = "EXPIRED";
    await link.save();
    throw new Error("Payment link expired");
  }

  const invoice = await Invoice.findById(link.invoiceId);

  // ✅ mark invoice as pending
  if (invoice.status !== "paid") {
    invoice.status = "pending";
    await invoice.save();
  }

  return { link, invoice };
};


