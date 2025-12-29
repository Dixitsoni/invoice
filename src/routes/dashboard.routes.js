import express from "express";
import { protect } from "../middleware/auth.js";
import Invoice from "../model/Invoice.js";
import Client from "../model/Client.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Get metrics and data for the dashboard
 */

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get dashboard metrics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalInvoiced:
 *                   type: number
 *                   example: 147500
 *                 pendingCount:
 *                   type: number
 *                   example: 1
 *                 overdueCount:
 *                   type: number
 *                   example: 2
 *                 invoiceTrend:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                         example: "Nov 2025"
 *                       amount:
 *                         type: number
 *                         example: 50000
 *                 recentInvoices:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       invoiceNumber:
 *                         type: string
 *                         example: "INV-2025-001"
 *                       client:
 *                         type: string
 *                         example: "TechSoft Pvt Ltd"
 *                       dueDate:
 *                         type: string
 *                         example: "2025-11-15"
 *                       status:
 *                         type: string
 *                         example: "Pending"
 *                       amount:
 *                         type: number
 *                         example: 59000
 *                 topClients:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       client:
 *                         type: string
 *                         example: "TechSoft Pvt Ltd"
 *                       totalBilled:
 *                         type: number
 *                         example: 245000
 */
router.get("/", protect, async (req, res) => {
  try {
    const invoices = await Invoice.find().populate('clientId');
    // Total invoiced
    const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

    // Pending / Overdue / Paid
    const pendingCount = invoices.filter(inv => inv.status === "Pending").length;
    const overdueCount = invoices.filter(inv => inv.status === "Overdue").length;

    // Invoice trend (last 6 months)
    const invoiceTrend = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = month.toLocaleString("default", { month: "short", year: "numeric" });
      const monthSum = invoices
        .filter(inv => new Date(inv.createdAt).getMonth() === month.getMonth() &&
          new Date(inv.createdAt).getFullYear() === month.getFullYear())
        .reduce((sum, inv) => sum + inv.amount, 0);
      invoiceTrend.push({ month: monthStr, amount: monthSum });
    }
    // Recent invoices (last 5)
    const recentInvoices = invoices
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5)
      .map(inv => ({
        invoiceNumber: inv.invoiceNumber,
        client: inv.clientId.name,
        dueDate: inv.dueDate,
        status: inv.status,
        amount: inv.totalAmount
      }));

    // Top clients
    const topClientsMap = {};
    invoices.forEach(inv => {
      if (!topClientsMap[inv.clientId.name]) topClientsMap[inv.clientId.name] = 0;
      topClientsMap[inv.clientId.name] += inv.totalAmount;
    });
    const topClients = Object.entries(topClientsMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([client, totalBilled]) => ({ client, totalBilled }));

    res.json({
      totalInvoiced,
      pendingCount,
      overdueCount,
      invoiceTrend,
      recentInvoices,
      topClients
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
