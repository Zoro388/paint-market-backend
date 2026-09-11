import crypto from "crypto";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

const createCheckout = asyncHandler(async (req, res) => {
  const { items, customer } = req.body;

  /*
  |--------------------------------------------------------------------------
  | VALIDATE CUSTOMER
  |--------------------------------------------------------------------------
  */

  if (!customer) {
    return res.status(400).json({
      success: false,
      message: "Customer information is required.",
    });
  }

  const {
    email,
    name,
    phone_number,
  } = customer;

  if (!email || !name || !phone_number) {
    return res.status(400).json({
      success: false,
      message:
        "Customer email, name and phone number are required.",
    });
  }

  /*
  |--------------------------------------------------------------------------
  | VALIDATE ITEMS
  |--------------------------------------------------------------------------
  */

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "At least one item is required.",
    });
  }

  /*
  |--------------------------------------------------------------------------
  | FIND USER BY EMAIL IF ACCOUNT EXISTS
  |--------------------------------------------------------------------------
  */

  let user = null;

  try {
    user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("_id");
  } catch (error) {
    console.log(
      "Could not find user by email:",
      error.message
    );
  }

  /*
  |--------------------------------------------------------------------------
  | PROCESS PRODUCTS
  |--------------------------------------------------------------------------
  */

  const orderedProducts = [];
  let totalAmount = 0;

  for (const item of items) {
    if (!item.id) {
      return res.status(400).json({
        success: false,
        message: "Every cart item must contain an id.",
      });
    }

    const quantity = Number(item.quantity);

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: `Invalid quantity for product ${item.id}.`,
      });
    }

    const product = await Product.findById(item.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found: ${item.id}`,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | CHECK STOCK
    |--------------------------------------------------------------------------
    */

    if (
      typeof product.stockQuantity === "number" &&
      product.stockQuantity < quantity
    ) {
      return res.status(400).json({
        success: false,
        message: `${product.name} does not have enough stock.`,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | IMPORTANT:
    | DO NOT TRUST item.price FROM FRONTEND
    |--------------------------------------------------------------------------
    */

    const unitPrice = Number(product.price);

    if (!Number.isFinite(unitPrice)) {
      return res.status(500).json({
        success: false,
        message: `Invalid price configured for ${product.name}.`,
      });
    }

    const subtotal = unitPrice * quantity;

    totalAmount += subtotal;

    orderedProducts.push({
      product: product._id,
      productName: product.name,
      selectedColour: item.selectedColour || "Default",
      quantity,
      unitPrice,
      subtotal,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | GENERATE FLUTTERWAVE TRANSACTION REFERENCE
  |--------------------------------------------------------------------------
  */

  const tx_ref = `PM-${Date.now()}-${crypto
    .randomBytes(5)
    .toString("hex")}`;

  /*
  |--------------------------------------------------------------------------
  | CREATE ORDER
  |--------------------------------------------------------------------------
  */

  const order = await Order.create({
    user: user ? user._id : undefined,

    customerName: name,

    email: email.toLowerCase().trim(),

    phoneNumber: phone_number,

    deliveryAddress: "Not provided",

    state: "Not provided",

    city: "Not provided",

    orderedProducts,

    totalAmount,

    paymentMethod: "flutterwave",

    paymentStatus: "pending",

    paymentReference: tx_ref,

    orderStatus: "pending",

    notes: "",
  });

  /*
  |--------------------------------------------------------------------------
  | CREATE PAYMENT RECORD
  |--------------------------------------------------------------------------
  */

  await Payment.create({
    user: user ? user._id : undefined,

    order: order._id,

    reference: tx_ref,

    amount: totalAmount,

    email: email.toLowerCase().trim(),

    status: "pending",

    paymentMethod: "flutterwave",
  });

  /*
  |--------------------------------------------------------------------------
  | RESPONSE EXPECTED BY FRONTEND
  |--------------------------------------------------------------------------
  */

  return res.status(201).json({
    success: true,
    amount: totalAmount,
    tx_ref,
    orderId: order._id,
  });
});

export {
  createCheckout,
};