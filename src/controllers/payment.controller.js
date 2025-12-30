import Stripe from "stripe";
import Razorpay from "razorpay";
import paypal from "@paypal/checkout-server-sdk";
import Invoice from "../model/Invoice.js";
import { configDotenv } from "dotenv";
import PaymentLink from "../model/PaymentLink.js";
import { createPaymentLink } from "../helper/createPyamentLink.js";
import { validatePaymentLink } from "./payment.validate.js";
import { sendInvoiceByMail } from "../utils/sendInvoiceMail.js";

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


configDotenv();

// ---------------- Stripe Payment ----------------

export const sendInvoiceLink = async (req, res) => {
  try {
    const { invoiceId } = req.body;
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    // Generate payment link
    const paymentUrl = await createPaymentLink(invoice);

    // Send link via WhatsApp, email, etc.
    // e.g., sendWhatsApp(invoice.clientPhone, paymentUrl)

    res.json({ paymentUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const generatePaymentLink = async (req, res) => {
  try {
    const { invoiceId } = req.body;

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    if (invoice.status === "paid") {
      return res.status(400).json({ message: "Invoice already paid" });
    }

    const paymentUrl = await createPaymentLink(invoice);

    // ✅ Mark invoice as SENT
    invoice.status = "sent";
    await invoice.save();

    await sendInvoiceByMail({
      to: invoice.clientId.email,
      clientName: invoice.clientId.name,
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.totalAmount,
      paymentLink: paymentUrl,
    });


    res.json({ paymentUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



export const paymentStripe = async (req, res) => {
  try {
    const { token } = req.body;
    const link = await validatePaymentLink(token);
    const invoice = await Invoice.findById(link.invoiceId);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `Invoice #${invoice._id}` },
            unit_amount: Math.round(invoice.totalAmount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `https://pay-ochre-five.vercel.app/success?token=${token}`,
      cancel_url: `https://pay-ochre-five.vercel.app/cancel`,
      metadata: { token },
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ---------------- Confirm Payment Endpoint ----------------
export const confirmPayment = async (req, res) => {
  try {
    const { token } = req.params;

    const link = await PaymentLink.findOne({ token });
    if (!link) return res.status(400).json({ message: "Invalid payment link" });

    if (link.status !== "PENDING") {
      return res.status(400).json({ message: "Link already used or expired" });
    }

    if (link.expiresAt < new Date()) {
      link.status = "EXPIRED";
      await link.save();
      return res.status(400).json({ message: "Payment link expired" });
    }

    // ✅ expire payment link
    link.status = "PAID";
    await link.save();

    const invoice = await Invoice.findById(link.invoiceId);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    // ✅ lowercase enum value
    invoice.status = "paid";
    await invoice.save();

    res.json({ invoice });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
    console.log(sessions)

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
