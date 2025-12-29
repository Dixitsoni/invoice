import express from "express";
import Stripe from "stripe";
import PaymentLink from "../model/PaymentLink.js";
import Invoice from "../model/Invoice.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/stripe", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const token = session.metadata.token;

    const link = await PaymentLink.findOne({ token });
    if (link && link.status === "PENDING") {
      link.status = "PAID";
      await link.save();

      await Invoice.findByIdAndUpdate(link.invoiceId, {
        status: "PAID"
      });
    }
  }

  res.json({ received: true });
});

export default router;
