import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import { connectDB } from "./config/db.js";
import { setupSecurity } from "./config/security.js";
import { setupSwagger } from "./config/swagger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import cron from "node-cron";

// Routes
import authRoutes from "./routes/auth.js";
import clientRoutes from "./routes/client.js";
import invoiceRoutes from "./routes/invoice.js";
import paymentRoutes from "./routes/payment.js";
import paymentSyncRoutes from "./routes/payment.sync.js";
import invoicePDFRoutes from "./routes/invoice.pdf.routes.js";
import twoFARoutes from "./routes/2fa.routes.js";
import recurringRoutes from "./routes/recurring.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import PaymentLink from "./model/PaymentLink.js";
import { confirmPayment } from "./controllers/payment.controller.js";
dotenv.config();

/* -------------------- DB -------------------- */
connectDB();
const app = express();

/* -------------------- Global Middlewares -------------------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* -------------------- Security -------------------- */
setupSecurity(app);

/* -------------------- Swagger -------------------- */
setupSwagger(app);

cron.schedule("*/30 * * * *", async () => {
  console.log("Running payment link expiry job");

  await PaymentLink.updateMany(
    {
      status: "PENDING",
      expiresAt: { $lt: new Date() }
    },
    {
      status: "EXPIRED"
    }
  );
});


/* -------------------- API Routes -------------------- */
app.use("/api/auth", authRoutes);

app.use("/api/clients", clientRoutes);           // ✅ Client CRUD

app.use("/api/invoices", invoiceRoutes);         // ✅ Invoice CRUD

// app.use("/api/invoices", invoicePDFRoutes);      // ✅ PDF + Email
app.use("/api/invoices", recurringRoutes);       // ✅ Recurring invoices

app.use("/api/payments", paymentRoutes);     
    // ✅ Stripe / Razorpay / PayPal
app.use("/api/payments/sync", paymentSyncRoutes);// ✅ Payment Sync (Webhook / Manual)

app.use("/api/2fa", twoFARoutes);                 // ✅ OTP + Google Authenticator
app.use("/api/dashboard", dashboardRoutes);       // ✅ Dashboard APIs

/* -------------------- Health -------------------- */
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    service: "Invoice Automation API",
    timestamp: new Date().toISOString(),
  });
});

/* -------------------- Error Handler -------------------- */
app.use(errorHandler);

/* -------------------- Server -------------------- */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📘 Swagger UI: http://localhost:${PORT}/api/docs`);
});
