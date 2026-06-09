import crypto from "crypto";

import Payment from "../models/Payment.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

import asyncHandler from "../utils/asyncHandler.js";

import paystack from "../services/paystack.service.js";


export const initializePayment =
  asyncHandler(async (req, res) => {
    const { orderId } = req.body;

    const order =
      await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const response =
      await paystack.post(
        "/transaction/initialize",
        {
          email: order.email,

          amount:
            order.totalAmount * 100,
        }
      );

    const payment =
      await Payment.create({
        user: req.user._id,

        order: order._id,

        reference:
          response.data.data
            .reference,

        amount:
          order.totalAmount,

        email: order.email,
      });

    res.status(200).json({
      success: true,
      authorization_url:
        response.data.data
          .authorization_url,

      reference:
        payment.reference,
    });
  });









  export const verifyPayment =
  asyncHandler(async (req, res) => {
    const { reference } = req.body;

    const response =
      await paystack.get(
        `/transaction/verify/${reference}`
      );

    const payment =
      await Payment.findOne({
        reference,
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message:
          "Payment record not found",
      });
    }

    if (
      response.data.data.status ===
      "success"
    ) {
      payment.status = "success";

      await payment.save();

      const order =
        await Order.findById(
          payment.order
        );

      order.paymentStatus =
        "paid";

      await order.save();

      // REDUCE STOCK

      for (const item of order.orderedProducts) {
        const product =
          await Product.findById(
            item.product
          );

        if (product) {
          product.stockQuantity -=
            item.quantity;

          await product.save();
        }
      }
    }

    res.status(200).json({
      success: true,
      payment,
    });
  });




  export const paymentHistory =
  asyncHandler(async (req, res) => {
    const payments =
      await Payment.find({
        user: req.user._id,
      })
        .populate("order")
        .sort({
          createdAt: -1,
        });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  });


  