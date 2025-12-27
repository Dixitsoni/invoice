import express from "express";
import { protect } from "../middleware/auth.js";
import Invoice from "../model/Invoice.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Recurring Invoices
 *   description: Manage recurring invoices
 */

/**
 * @swagger
 * /api/invoices/recurring/run:
 *   post:
 *     summary: Manually trigger recurring invoices
 *     tags: [Recurring Invoices]
 *     security:
 *       - bearerAuth: []
 *     description: This endpoint will create new invoices based on all recurring invoices.
 *     responses:
 *       200:
 *         description: Recurring invoices triggered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 created:
 *                   type: array
 *                   items:
 *                     type: string
 *                     description: ID of newly created invoice
 *                     example: 64ab1234cdef56789abcd123
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/recurring/run", protect, async (req, res) => {
  try {
    const recurringInvoices = await Invoice.find({ status: "recurring" });
    const created = [];

    for (const invoice of recurringInvoices) {
      const newInvoice = await Invoice.create({
        ...invoice.toObject(),
        _id: undefined,
        status: "draft",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      created.push(newInvoice._id);
    }

    res.json({ success: true, created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
