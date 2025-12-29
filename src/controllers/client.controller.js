import Stripe from "stripe";
import Client from "../model/Client.js";
import { configDotenv } from "dotenv";

configDotenv()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


/**
 * @desc Create new client
 */
export const createClient = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    await stripe.customers.create({
      name,
      email,
      phone,
    });

    const client = await Client.create({
      ...req.body,
      createdBy: req.user.id,
    });

    client.save()

    res.json({
      message: 'Client is created Successfully',
      error: false
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }

};

/**
 * @desc Update client
 */
export const updateClient = async (req, res) => {
  const client = await Client.findOneAndUpdate(
    { _id: req.params.id, createdBy: req.user.id },
    req.body,
    { new: true }
  );

  if (!client) {
    return res.status(404).json({ message: "Client not found" });
  }

  res.json({
    success: true,
    data: client,
  });
};

/**
 * @desc Get single client
 */
export const getClientById = async (req, res) => {
  const client = await Client.findOne({
    _id: req.params.id,
    // createdBy: req.user.id,
  });

  if (!client) {
    return res.status(404).json({ message: "Client not found" });
  }

  res.json({
    success: true,
    data: client,
  });
};

/**
 * @desc List clients (pagination + search)
 */
export const getClients = async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;

  const query = {
    createdBy: req.user.id,
    name: { $regex: search, $options: "i" },
  };

  const clients = await Client.find()
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await Client.countDocuments(query);

  res.json({
    success: true,
    total,
    page: Number(page),
    limit: Number(limit),
    data: clients,
  });
};



/**
 * @desc    Soft delete client
 * @route   DELETE /api/clients/:id
 * @access  Private
 */
export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    client.isDeleted = true;
    await client.save();

    res.json({
      success: true,
      message: "Client deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};