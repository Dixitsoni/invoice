import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
} from "../controllers/invoice.controller.js";
import { generateInvoicePDF, sendInvoiceEmail } from "../controllers/invoice.pdf.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Invoices
 *   description: Invoice management (create, list, get by ID)
 */

/**
 * @swagger
 * /api/invoices:
 *   post:
 *     summary: Create a new invoice
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clientId:
 *                 type: string
 *                 description: ID of the client
 *                 example: 64ab1234cdef56789abcd123
 *               invoiceNumber:
 *                 type: string
 *                 description: Invoice number
 *                 example: INV-1001
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     description:
 *                       type: string
 *                       example: Website Design
 *                     quantity:
 *                       type: number
 *                       example: 1
 *                     price:
 *                       type: number
 *                       example: 500
 *               totalAmount:
 *                 type: number
 *                 example: 500
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 example: 2025-12-31
 *     responses:
 *       201:
 *         description: Invoice created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 invoice:
 *                   type: object
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/", protect, createInvoice);


/**
 * @swagger
 * /api/invoices/{id}:
 *   put:
 *     summary: Update an invoice
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invoice ID
 *         example: 64ab1234cdef56789abcd123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InvoiceUpdate'
 *     responses:
 *       200:
 *         description: Invoice updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Invoice'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Invoice not found
 */
router.put("/:id", protect, updateInvoice);


/**
 * @swagger
 * /api/invoices:
 *   get:
 *     summary: Get all invoices
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of invoices
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 invoices:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/", protect, getInvoices);

/**
 * @swagger
 * /api/invoices/{id}:
 *   get:
 *     summary: Get invoice by ID
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invoice ID
 *         example: 64ab1234cdef56789abcd123
 *     responses:
 *       200:
 *         description: Invoice details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 invoice:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Invoice not found
 *       500:
 *         description: Server error
 */
router.get("/:id", protect, getInvoiceById);



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
