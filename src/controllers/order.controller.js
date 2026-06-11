import Order from "../models/Order.js";
import Product from "../models/Product.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createOrder = asyncHandler(
  async (req, res) => {
    console.log("ORDER BODY:", req.body);
    // console.log("REQ USER:", req.user);
    console.log("REQ USER:",JSON.stringify(req.user, null, 2));
    console.log("REQ BODY:",JSON.stringify(req.body, null, 2));
    
    try {
      console.log(
        "========== CREATE ORDER =========="
      );

      console.log(
        "REQ USER:",
        JSON.stringify(req.user, null, 2)
      );

      console.log(
        "REQ BODY:",
        JSON.stringify(req.body, null, 2)
      );

      const {
        deliveryAddress,
        state,
        city,
        paymentMethod,
        notes,
        orderedProducts,
      } = req.body;

      if (
        !orderedProducts ||
        orderedProducts.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "No products selected",
        });
      }

      let totalAmount = 0;

      const processedProducts = [];

for (const item of orderedProducts) {

  console.log(
    "ORDER ITEM:",
    JSON.stringify(item, null, 2)
  );

  console.log(
    "PRODUCT ID RECEIVED:",
    item.productId
  );

  const product =
    await Product.findById(
      item.productId
    );

  console.log(
    "PRODUCT FOUND:",
    product
  );

  if (!product) {
    return res.status(404).json({
      success: false,
      message: `Product not found: ${item.productId}`,
    });
  }
        const subtotal =
          product.price * item.quantity;

        totalAmount += subtotal;

        processedProducts.push({
          product: product._id,
          productName:
            product.productName,
          selectedColour:
            item.selectedColour,
          quantity: item.quantity,
          unitPrice: product.price,
          subtotal,
        });
      }

      const order =
        await Order.create({
          user: req.user._id,

          customerName: `${req.user.firstName} ${req.user.lastName}`,

          email: req.user.email,

          phoneNumber:
            req.user.phoneNumber,

          deliveryAddress,
          state,
          city,

          orderedProducts:
            processedProducts,

          totalAmount,

          paymentMethod,

          notes,
        });

      console.log(
        "ORDER CREATED:",
        order._id
      );

      res.status(201).json({
        success: true,
        message:
          "Order created successfully",
        order,
      });
    } catch (error) {
      console.error(
        "CREATE ORDER ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);




  export const getMyOrders =
  asyncHandler(async (req, res) => {
    const orders =
      await Order.find({
        user: req.user._id,
      }).sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  });



export const getOrder =
  asyncHandler(async (req, res) => {
    const order =
      await Order.findById(
        req.params.id
      );

    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          "Order not found",
      });
    }

    const isOwner =
      order.user.toString() ===
      req.user._id.toString();

    const isAdmin =
      req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  });



//   ADMIN GET ALL ORDER

export const getOrders =
  asyncHandler(async (req, res) => {
    const orders =
      await Order.find()
        .populate(
          "user",
          "firstName lastName email"
        )
        .sort({
          createdAt: -1,
        });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  });



  export const updateOrderStatus =
  asyncHandler(async (req, res) => {
    const order =
      await Order.findById(
        req.params.id
      );

    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          "Order not found",
      });
    }

    order.orderStatus =
      req.body.orderStatus;

    await order.save();

    res.status(200).json({
      success: true,
      message:
        "Order status updated",
      order,
    });
  });