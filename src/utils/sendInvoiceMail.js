import nodemailer from "nodemailer";

export const sendInvoiceByMail = async ({
  to,
  clientName,
  invoiceNumber,
  amount,
  paymentLink,
}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const html = `
  <div style="font-family:Arial;max-width:600px;margin:auto;border:1px solid #ddd;padding:20px">
    <h2 style="color:#4f46e5">Invoice #${invoiceNumber}</h2>

    <p>Hello <b>${clientName}</b>,</p>

    <p>Your invoice has been generated.</p>

    <p><b>Amount:</b> ₹${amount}</p>

    <a href="${paymentLink}"
      style="
        display:inline-block;
        padding:12px 20px;
        background:#4f46e5;
        color:#fff;
        text-decoration:none;
        border-radius:6px;
        margin-top:12px
      ">
      Pay Invoice
    </a>

    <p style="margin-top:20px;color:#555">
      ⚠️ This payment link will expire after payment or 24 hours.
    </p>

    <p>Thank you,<br/>Invoice Team</p>
  </div>
  `;

  await transporter.sendMail({
    from: `"Invoice App" <${process.env.GMAIL_USER}>`,
    to,
    subject: `Invoice #${invoiceNumber} – Payment Link`,
    html,
  });
};
