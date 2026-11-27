
import crypto from "crypto";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import Product from "../models/Product.js";
import Tool from "../models/Tool.js";
import {
  createNombaCheckout,
  verifyNombaTransaction,
} from "../services/nomba.service.js";

// Existing Paintdomain delivery policy
const DELIVERY_FEE_PER_BUCKET = 5500;
const ABUJA_STATE = "FCT - Abuja";
const FREE_DELIVERY_MINIMUM = 50;

function calculateDeliveryFee(state, bucketCount) {
  if (
    state === ABUJA_STATE &&
    bucketCount >= FREE_DELIVERY_MINIMUM
  ) {
    return 0;
  }

  return bucketCount * DELIVERY_FEE_PER_BUCKET;
}

// ==========================================
// INITIALIZE NOMBA SHOP CHECKOUT
// ==========================================

export const initializeNombaPayment = async (req, res) => {
  let createdOrder = null;
  let createdPayment = null;

  try {
    const {
      deliveryAddress,
      state,
      city,
      notes,
      orderedProducts,
    } = req.body;

    if (
      !deliveryAddress ||
      !state ||
      !city ||
      !Array.isArray(orderedProducts) ||
      orderedProducts.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide your delivery details and cart items.",
      });
    }

    if (!req.user?._id || !req.user?.email) {
      return res.status(401).json({
        success: false,
        message: "Please log in before making payment.",
      });
    }

    let subtotal = 0;
    let bucketCount = 0;
    const orderItems = [];

    for (const item of orderedProducts) {
      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: "Invalid item quantity.",
        });
      }

      if (item.itemType === "tool" || item.toolId) {
        if (!item.toolId) {
          return res.status(400).json({
            success: false,
            message: "A valid tool ID is required.",
          });
        }

        const tool = await Tool.findById(item.toolId);

        if (!tool || !Number(tool.price) || Number(tool.price) <= 0) {
          return res.status(400).json({
            success: false,
            message: "A tool is unavailable or has no valid price.",
          });
        }

        const unitPrice = Number(tool.price);
        const itemSubtotal = unitPrice * quantity;

        subtotal += itemSubtotal;

        orderItems.push({
          itemType: "tool",
          tool: tool._id,
          productName: tool.name,
          selectedColour: "Default",
          quantity,
          unitPrice,
          subtotal: itemSubtotal,
        });

        continue;
      }

      if (!item.productId) {
        return res.status(400).json({
          success: false,
          message: "A valid product ID is required.",
        });
      }

      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "A product in your cart could not be found.",
        });
      }

      if (product.stockAvailability === "out_of_stock") {
        return res.status(400).json({
          success: false,
          message: `${product.productName} is out of stock.`,
        });
      }

      const selectedColour = item.selectedColour || "Default";

      if (
        Array.isArray(product.variants) &&
        product.variants.length > 0 &&
        !product.variants.some(
          (variant) => variant.colourName === selectedColour
        )
      ) {
        return res.status(400).json({
          success: false,
          message: `The selected colour for ${product.productName} is unavailable.`,
        });
      }

      const unitPrice = Number(product.price);

      if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
        return res.status(400).json({
          success: false,
          message: `${product.productName} has an invalid price.`,
        });
      }

      const itemSubtotal = unitPrice * quantity;

      subtotal += itemSubtotal;
      bucketCount += quantity;

      orderItems.push({
        itemType: "product",
        product: product._id,
        productName: product.productName,
        selectedColour,
        quantity,
        unitPrice,
        subtotal: itemSubtotal,
      });
    }

    const deliveryFee = calculateDeliveryFee(state, bucketCount);
    const totalAmount = subtotal + deliveryFee;

    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "The order total is invalid.",
      });
    }

    const orderReference = `PD-${crypto.randomUUID()}`;

    createdOrder = await Order.create({
      user: req.user._id,
      customerName: `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim(),
      customerEmail: req.user.email,
      email: req.user.email,
      phoneNumber: req.user.phoneNumber,
      deliveryAddress,
      state,
      city,
      orderedProducts: orderItems,
      totalAmount,
      paymentMethod: "nomba",
      paymentStatus: "pending",
      paymentReference: orderReference,
      orderStatus: "pending",
      notes: notes || "",
    });

    createdPayment = await Payment.create({
      user: req.user._id,
      order: createdOrder._id,
      reference: orderReference,
      amount: totalAmount,
      email: req.user.email,
      status: "pending",
      paymentMethod: "nomba",
    });

    const frontendUrl = process.env.FRONTEND_URL;

    if (!frontendUrl) {
      throw new Error("FRONTEND_URL is not configured.");
    }

    const callbackUrl =
      `${frontendUrl.replace(/\/$/, "")}/checkout/payment-callback` +
      `?reference=${encodeURIComponent(orderReference)}`;

    const checkout = await createNombaCheckout({
      amount: totalAmount,
      customerEmail: req.user.email,
      orderReference,
      callbackUrl,
      metadata: {
        orderId: createdOrder._id.toString(),
        paymentType: "shop_order",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Nomba checkout created successfully.",
      checkoutLink: checkout.checkoutLink,
      orderId: createdOrder._id,
      reference: orderReference,
      subtotal,
      deliveryFee,
      totalAmount,
    });
  } catch (error) {
    console.error(
      "Nomba payment initialization error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Unable to initialize Nomba payment.",
    });
  }
};

// ==========================================
// VERIFY NOMBA SHOP PAYMENT
// ==========================================

export const verifyNombaPayment = async (req, res) => {
  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: "Payment reference is required.",
      });
    }

    const payment = await Payment.findOne({
      reference,
      paymentMethod: "nomba",
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found.",
      });
    }

    if (
      payment.user &&
      payment.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to verify this payment.",
      });
    }

    const order = await Order.findById(payment.order);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this order.",
      });
    }

    // Repeated verification must not process the order twice.
    if (
      payment.status === "success" &&
      order.paymentStatus === "paid"
    ) {
      return res.status(200).json({
        success: true,
        paid: true,
        message: "Payment has already been confirmed.",
        orderId: order._id,
        reference,
      });
    }

    const transaction = await verifyNombaTransaction(reference);

    const transactionStatus =
      transaction.transactionDetails?.status;

    const returnedReference =
      transaction.order?.orderReference;

    const paidAmount = Number(transaction.order?.amount);

    const currency = transaction.order?.currency;

    if (
      transactionStatus !== "PAYMENT SUCCESSFUL" ||
      returnedReference !== reference ||
      currency !== "NGN" ||
      !Number.isFinite(paidAmount) ||
      paidAmount < Number(order.totalAmount)
    ) {
      return res.status(400).json({
        success: false,
        paid: false,
        message: "Nomba has not confirmed the full payment for this order.",
      });
    }

    payment.status = "success";
    payment.transactionId =
      transaction.paymentReference ||
      transaction.transactionDetails?.transactionId ||
      reference;
    payment.paidAt = new Date();

    order.paymentStatus = "paid";
    order.orderStatus = "processing";

    await payment.save();
    await order.save();

    return res.status(200).json({
      success: true,
      paid: true,
      message: "Payment verified and order confirmed.",
      orderId: order._id,
      reference,
      totalAmount: order.totalAmount,
    });
  } catch (error) {
    console.error(
      "Nomba payment verification error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      paid: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Unable to verify Nomba payment.",
    });
  }
};
