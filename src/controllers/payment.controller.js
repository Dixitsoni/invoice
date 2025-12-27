import Stripe from "stripe";
import Razorpay from "razorpay";
import paypal from "@paypal/checkout-server-sdk";
import Invoice from "../model/Invoice.js";
import { configDotenv } from "dotenv";

configDotenv();
// ---------- Stripe Setup ----------
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ---------- Razorpay Setup ----------
// const razorpayInstance = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });


// ---------- PayPal Setup ----------
const paypalEnv =
  process.env.NODE_ENV === "production"
    ? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
    : new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);

const paypalClient = new paypal.core.PayPalHttpClient(paypalEnv);

export const paymentStripe = async (req, res) => {
  try {
    const { amount, invoiceId } = req.body;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: "Test Product" },
          unit_amount: 50,
        },
        quantity: 1,
      }],
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    });

    res.json({ url: session.url });

    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: amount, // in cents
    //   currency: "usd",
    //   description: "Invoice Payment",
    //   metadata: { invoiceId },
    //   receipt_email: req.body.email,
    //   shipping: {
    //     name: req.body.name,
    //     address: {
    //       line1: req.body.addressLine1,
    //       city: req.body.city,
    //       state: req.body.state,
    //       postal_code: req.body.postalCode,
    //       country: req.body.country,
    //     },
    //     phone: req.body.phone,
    //     email: req.body.email,
    //   },
    //   // automatic_payment_methods: { enabled: true },
    // });


    // res.status(200).json({
    //   clientSecret: paymentIntent.client_secret,
    // });
  } catch (err) {
    res.status(400).status(500).json({ error: err.message });
  }
};
// ---------- Stripe Payment ----------
export const createStripePayment = async (req, res, next) => {
  try {
    const { invoiceId } = req.body;
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    const paymentIntents = await stripe.paymentIntents.list();

    const charges = await stripe.charges.list();

    const sessions = await stripe.checkout.sessions.list();


    res.json({ paymentIntents });

  } catch (err) {
    next(err);
  }
};

// ---------- Razorpay Payment ----------
export const createRazorpayPayment = async (req, res, next) => {
  try {
    const { invoiceId } = req.body;
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    const options = {
      amount: Math.round(invoice.totalAmount * 100),
      currency: "INR",
      receipt: `invoice_${invoice._id}`,
    };

    // const order = await razorpayInstance.orders.create(options);
    // res.json(order);
  } catch (err) {
    next(err);
  }
};

// ---------- PayPal Payment ----------
export const createPayPalPayment = async (req, res, next) => {
  try {
    const { invoiceId } = req.body;
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [{ amount: { currency_code: "USD", value: invoice.totalAmount.toFixed(2) } }],
    });

    const order = await paypalClient.execute(request);
    res.json({ id: order.result.id });
  } catch (err) {
    next(err);
  }
};
