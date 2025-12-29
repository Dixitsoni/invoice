import Invoice from "../model/Invoice.js";

// CREATE INVOICE
export const createInvoice = async (req, res, next) => {
  try {
    const {
      invoiceNumber,
      clientId,
      items,
      tax,
      dueDate
    } = req.body;

    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );
    const totalAmount = tax ? subtotal + tax : subtotal;

    const invoice = await Invoice.create({
      invoiceNumber,
      clientId,
      items: items.map(item => ({
        ...item,
        total: item.quantity * item.price
      })),
      subtotal,
      tax,
      totalAmount,
      dueDate
    });

    res.status(201).json({
      success: true,
      data: invoice
    });
  } catch (err) {
    next(err);
  }
};

// GET ALL INVOICES
export const getInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find()
      .populate("clientId")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: invoices.length,
      data: invoices
    });
  } catch (err) {
    next(err);
  }
};

// GET SINGLE INVOICE
export const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate("clientId");

    if (!invoice)
      return res.status(404).json({ message: "Invoice not found" });

    res.json({
      success: true,
      data: invoice
    });
  } catch (err) {
    next(err);
  }
};

// UPDATE INVOICE
export const updateInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!invoice)
      return res.status(404).json({ message: "Invoice not found" });

    res.json({
      success: true,
      data: invoice
    });
  } catch (err) {
    next(err);
  }
};

// DELETE INVOICE
export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Optional: block delete if paid
    if (invoice.status === "paid") {
      return res.status(400).json({ message: "Paid invoice cannot be deleted" });
    }

    await invoice.deleteOne();
    res.json({ message: "Invoice deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

