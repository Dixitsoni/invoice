import express from "express";
import { protect } from "../middleware/auth.js";
import { generateInvoicePDF, sendInvoiceEmail } from "../controllers/invoice.pdf.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Invoice PDF & Email
 *   description: Generate invoice PDF and send via email
 */

/**
 * @swagger
 * /api/invoices/pdf/{invoiceId}:
 *   get:
 *     summary: Generate invoice PDF
 *     tags: [Invoice PDF & Email]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the invoice to generate PDF for
 *         example: 64ab1234cdef56789abcd123
 *     responses:
 *       200:
 *         description: PDF generated successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Invoice not found
 *       500:
 *         description: Server error
 */
router.get("/pdf/:invoiceId", protect, generateInvoicePDF);

/**
 * @swagger
 * /api/invoices/email:
 *   post:
 *     summary: Send invoice PDF via email
 *     tags: [Invoice PDF & Email]
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
 *                 description: ID of the invoice to send
 *                 example: 64ab1234cdef56789abcd123
 *               email:
 *                 type: string
 *                 description: Recipient email (optional; defaults to client email)
 *                 example: client@example.com
 *     responses:
 *       200:
 *         description: Invoice emailed successfully
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
 *                   example: Invoice emailed successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Invoice not found
 *       500:
 *         description: Server error
 */
router.post("/email", protect, sendInvoiceEmail);

export default router;
