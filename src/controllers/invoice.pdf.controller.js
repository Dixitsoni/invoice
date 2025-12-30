import PDFDocument from "pdfkit";
import fs from "fs";
import nodemailer from "nodemailer";
import Invoice from "../model/Invoice.js";

// Generate PDF for invoice
export const generateInvoicePDF = async (req, res, next) => {
  try {
    const { invoiceId } = req.params;
    const invoice = await Invoice.findById(invoiceId).populate("clientId");
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    const doc = new PDFDocument();
    const filePath = `./tmp/invoice_${invoice._id}.pdf`;
    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(20).text("Invoice", { align: "center" });
    doc.text(`Invoice Number: ${invoice.invoiceNumber}`);
    doc.text(`Client: ${invoice.clientId.name}`);
    doc.text(`Total Amount: ${invoice.totalAmount}`);
    doc.text(`Due Date: ${invoice.dueDate.toDateString()}`);
    doc.end();

    res.download(filePath);
  } catch (err) {
    next(err);
  }
};

// Send PDF via Email
export const sendInvoiceEmail = async (req, res, next) => {
  try {
    const { invoiceId, email } = req.body;
    const invoice = await Invoice.findById(invoiceId).populate("clientId");
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    const filePath = `./tmp/invoice_${invoice._id}.pdf`;
    // Generate PDF before sending
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(filePath));
    doc.fontSize(20).text("Invoice", { align: "center" });
    doc.text(`Invoice Number: ${invoice.invoiceNumber}`);
    doc.text(`Client: ${invoice.clientId.name}`);
    doc.text(`Total Amount: ${invoice.totalAmount}`);
    doc.end();

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: `"Invoice Automation" <${process.env.SMTP_USER}>`,
      to: email || invoice.clientId.email,
      subject: `Invoice #${invoice.invoiceNumber}`,
      text: `Please find your invoice attached.`,
      attachments: [{ path: filePath }],
    });

    res.json({ success: true, message: "Invoice emailed successfully" });
  } catch (err) {
    next(err);
  }
};
