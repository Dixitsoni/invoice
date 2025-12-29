import Stripe from "stripe";
import PaymentLink from "../model/PaymentLink.js";
import Invoice from "../model/Invoice.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createStripeCheckout = async (req, res) => {
  try {
    const { token } = req.body;

    const link = await PaymentLink.findOne({ token });
    if (!link || link.status !== "PENDING")
      return res.status(400).json({ message: "Invalid link" });

    const invoice = await Invoice.findById(link.invoiceId);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: `Invoice ${invoice._id}` },
          unit_amount: Math.round(invoice.totalAmount * 100),
        },
        quantity: 1
      }],
      success_url: `${process.env.FRONTEND_URL}/success?token=${token}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      metadata: { token }
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
