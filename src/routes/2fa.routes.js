import express from "express";
import { generate2FASecret, verify2FA } from "../controllers/2fa.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: 2FA
 *   description: Two-factor authentication for users
 */

/**
 * @swagger
 * /api/2fa/generate:
 *   get:
 *     summary: Generate a 2FA secret and QR code for Google Authenticator
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA secret generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 secret:
 *                   type: string
 *                   description: Base32 encoded secret
 *                   example: JBSWY3DPEHPK3PXP
 *                 qrCodeUrl:
 *                   type: string
 *                   description: Data URL for QR code to scan in Google Authenticator
 *                   example: data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/generate", protect, generate2FASecret);

/**
 * @swagger
 * /api/2fa/verify:
 *   post:
 *     summary: Verify the 2FA TOTP token
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: TOTP token from Google Authenticator
 *                 example: "123456"
 *               secret:
 *                 type: string
 *                 description: Base32 secret previously generated
 *                 example: JBSWY3DPEHPK3PXP
 *     responses:
 *       200:
 *         description: Token verification result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 verified:
 *                   type: boolean
 *                   description: Whether the token is valid
 *                   example: true
 *       400:
 *         description: Missing or invalid token/secret
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/verify", protect, verify2FA);

export default router;
