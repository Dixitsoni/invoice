import express from "express";
import { protect } from "../middleware/auth.js";
import {
  syncStripePayment,
  syncRazorpayPayment,
  syncPayPalPayment,
} from "../controllers/payment.sync.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payment Sync
 *   description: Webhook / Sync payment status with system
 */

/**
 * @swagger
 * /api/payments/sync/stripe:
 *   post:
 *     summary: Sync Stripe payment status
 *     tags: [Payment Sync]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Stripe webhook payload
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               invoiceId:
 *                 type: string
 *                 example: 64ab1234cdef56789abcd123
 *               status:
 *                 type: string
 *                 description: Payment status (paid, failed, refunded)
 *                 example: paid
 *               paymentIntentId:
 *                 type: string
 *                 example: pi_3KZ5hY2eZvKYlo2CHsU...
 *     responses:
 *       200:
 *         description: Payment synced successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Stripe payment synced
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/stripe", protect, syncStripePayment);

/**
 * @swagger
 * /api/payments/sync/razorpay:
 *   post:
 *     summary: Sync Razorpay payment status
 *     tags: [Payment Sync]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Razorpay payment payload
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               invoiceId:
 *                 type: string
 *                 example: 64ab1234cdef56789abcd123
 *               status:
 *                 type: string
 *                 description: Payment status (paid, failed, refunded)
 *                 example: paid
 *               razorpayPaymentId:
 *                 type: string
 *                 example: pay_29QQoUBi66xm2f
 *     responses:
 *       200:
 *         description: Payment synced successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Razorpay payment synced
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/razorpay", protect, syncRazorpayPayment);

/**
 * @swagger
 * /api/payments/sync/paypal:
 *   post:
 *     summary: Sync PayPal payment status
 *     tags: [Payment Sync]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: PayPal payment payload
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               invoiceId:
 *                 type: string
 *                 example: 64ab1234cdef56789abcd123
 *               status:
 *                 type: string
 *                 description: Payment status (completed, failed, refunded)
 *                 example: completed
 *               paypalOrderId:
 *                 type: string
 *                 example: 5O190127TN364715T
 *     responses:
 *       200:
 *         description: Payment synced successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: PayPal payment synced
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/paypal", protect, syncPayPalPayment);


export default router;
