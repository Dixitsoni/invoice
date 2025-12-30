import mongoose from "mongoose";

const paymentLinkSchema = new mongoose.Schema({
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Invoice",
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true
  },
  expiresAt: Date,
  status: {
    type: String,
    enum: ["PENDING", "PAID", "EXPIRED"],
    default: "PENDING",
  },
});


export default mongoose.model("PaymentLink", paymentLinkSchema);
