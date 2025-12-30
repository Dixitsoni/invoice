import express from "express";
import { createStripePayment, createRazorpayPayment, createPayPalPayment, paymentStripe, sendInvoiceLink, generatePaymentLink, confirmPayment } from "../controllers/payment.controller.js";
import { protect } from "../middleware/auth.js";
import { validatePaymentLink } from "../controllers/payment.validate.js";
import { createStripeCheckout } from "../controllers/stripe.payment.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment gateways (Stripe, Razorpay, PayPal)
 */

/**
 * @swagger
 * /api/payments/stripe:
 *   post:
 *     summary: Create Stripe payment intent
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               invoiceId:
 *                 type: string
 *                 description: ID of the invoice to pay
 *                 example: 64ab1234cdef56789abcd123
 *     responses:
 *       200:
 *         description: Stripe payment intent created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clientSecret:
 *                   type: string
 *                   description: Stripe client secret
 *                   example: pi_3KZ5hY2eZvKYlo2CHsU...
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Invoice not found
 *       500:
 *         description: Server error
 */
router.post("/stripe", protect, createStripePayment);

/**
 * @swagger
 * /api/payments/create-payment-intent:
 *   post:
 *     summary: Create Stripe Payment Intent
 *     description: Creates a Stripe PaymentIntent for an invoice and returns the client secret.
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - invoiceId
 *             properties:
 *               invoiceId:
 *                 type: string
 *                 description: ID of the invoice to be paid
 *                 example: 64ab1234cdef56789abcd123
 *     responses:
 *       200:
 *         description: Stripe PaymentIntent created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clientSecret:
 *                   type: string
 *                   description: Stripe PaymentIntent client secret
 *                   example: pi_3NabcXYZ_secret_123456
 *                 paymentIntentId:
 *                   type: string
 *                   description: Stripe PaymentIntent ID
 *                   example: pi_3NabcXYZ
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Invoice not found
 *       500:
 *         description: Internal server error
 */
router.post("/create-payment-intent", createStripeCheckout);

router.get("/validate/:token", validatePaymentLink);

router.post('/generate-link', generatePaymentLink)

router.post("/confirm/:token", confirmPayment);


/**
 * @swagger
 * /api/payments/razorpay:
 *   post:
 *     summary: Create Razorpay order
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               invoiceId:
 *                 type: string
 *                 description: ID of the invoice to pay
 *                 example: 64ab1234cdef56789abcd123
 *     responses:
 *       200:
 *         description: Razorpay order created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Invoice not found
 *       500:
 *         description: Server error
 */
// router.post("/razorpay", protect, createRazorpayPayment);

/**
 * @swagger
 * /api/payments/paypal:
 *   post:
 *     summary: Create PayPal order
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               invoiceId:
 *                 type: string
 *                 description: ID of the invoice to pay
 *                 example: 64ab1234cdef56789abcd123
 *     responses:
 *       200:
 *         description: PayPal order created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: PayPal order ID
 *                   example: 5O190127TN364715T
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Invoice not found
 *       500:
 *         description: Server error
 */
// router.post("/paypal", protect, createPayPalPayment);

export default router;
