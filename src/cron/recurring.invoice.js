import cron from "node-cron";
import Invoice from "../models/Invoice.js";

// Every day at 00:00
cron.schedule("0 0 * * *", async () => {
  try {
    const recurringInvoices = await Invoice.find({ status: "recurring" });

    for (const invoice of recurringInvoices) {
      const newInvoice = await Invoice.create({
        ...invoice.toObject(),
        _id: undefined,
        status: "draft",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`Recurring invoice created: ${newInvoice._id}`);
    }
  } catch (err) {
    console.error("Recurring invoice cron error:", err.message);
  }
});
