import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createClient,
  updateClient,
  getClientById,
  getClients,
  deleteClient,
} from "../controllers/client.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Clients
 *   description: Client management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Client:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 65f1a9c1b4d2a00123abcd45
 *         name:
 *           type: string
 *           example: John Doe
 *         email:
 *           type: string
 *           example: john@example.com
 *         company:
 *           type: string
 *           example: Acme Pvt Ltd
 *         phone:
 *           type: string
 *           example: "+91-9876543210"
 *         gstNumber:
 *           type: string
 *           example: "22AAAAA0000A1Z5"
 *         panNumber:
 *           type: string
 *           example: "AAAAA0000A"
 *         address:
 *           type: string
 *           example: "123, Main Street, City"
 *         state:
 *           type: string
 *           example: "California"
 *         country:
 *           type: string
 *           example: "USA"
 *         isDeleted:
 *           type: boolean
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/clients:
 *   get:
 *     summary: Get all clients
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of clients
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Client'
 *       401:
 *         description: Unauthorized
 */
router.get("/", protect, getClients);

/**
 * @swagger
 * /api/clients/{id}:
 *   get:
 *     summary: Get client by ID
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 65f1a9c1b4d2a00123abcd45
 *     responses:
 *       200:
 *         description: Client details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Client'
 *       404:
 *         description: Client not found
 */
router.get("/:id", protect, getClientById);

/**
 * @swagger
 * /api/clients:
 *   post:
 *     summary: Create a new client
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               company:
 *                 type: string
 *                 example: Acme Pvt Ltd
 *               phone:
 *                 type: string
 *                 example: "+91-9876543210"
 *               gstNumber:
 *                 type: string
 *                 example: "22AAAAA0000A1Z5"
 *               panNumber:
 *                 type: string
 *                 example: "AAAAA0000A"
 *               address:
 *                 type: string
 *                 example: "123, Main Street, City"
 *               state:
 *                 type: string
 *                 example: "California"
 *               country:
 *                 type: string
 *                 example: "USA"
 *     responses:
 *       201:
 *         description: Client created successfully
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
 *                   example: Client created successfully
 *       400:
 *         description: Client already exists
 */
router.post("/", protect, createClient);

/**
 * @swagger
 * /api/clients/{id}:
 *   put:
 *     summary: Update client details
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Updated
 *               company:
 *                 type: string
 *                 example: Updated Corp
 *               phone:
 *                 type: string
 *                 example: "+91-9999999999"
 *     responses:
 *       200:
 *         description: Client updated successfully
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
 *                   example: Client updated successfully
 *       404:
 *         description: Client not found
 */
router.put("/:id", protect, updateClient);

/**
 * @swagger
 * /api/clients/{id}:
 *   delete:
 *     summary: Soft delete client
 *     description: Marks the client as deleted without removing from database
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Client soft deleted
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
 *                   example: Client deleted successfully (soft delete)
 *       404:
 *         description: Client not found
 */
router.delete("/:id", protect, deleteClient);

export default router;
