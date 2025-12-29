import crypto from "crypto";
import PaymentLink from "../model/PaymentLink.js";

export const createPaymentLink = async (invoice) => {
  const token = crypto.randomUUID();

  await PaymentLink.create({
    invoiceId: invoice._id,
    token,
    amount: invoice.totalAmount,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  });

  return `${process.env.FRONTEND_URL}/pay/${token}`;
};
