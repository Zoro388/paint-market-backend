import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import asyncHandler from "../utils/asyncHandler.js";

export const addToCart =
  asyncHandler(async (req, res) => {

    const {
      productId,
      quantity,
      selectedColour,
    } = req.body;

    const product =
      await Product.findById(
        productId
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found",
      });
    }

    let cart =
      await Cart.findOne({
        user: req.user._id,
      });

    if (!cart) {
      cart =
        await Cart.create({
          user: req.user._id,
          items: [],
        });
    }

    const existingItem =
      cart.items.find(
        (item) =>
          item.product.toString() ===
            productId &&
          item.selectedColour ===
            selectedColour
      );

    if (existingItem) {
      existingItem.quantity +=
        quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        selectedColour,
      });
    }

    await cart.save();

    res.status(200).json({
      success: true,
      message:
        "Added to cart",
      cart,
    });

  });

export const getCart =
  asyncHandler(async (req, res) => {

    const cart =
      await Cart.findOne({
        user: req.user._id,
      }).populate(
        "items.product"
      );

    res.status(200).json({
      success: true,
      cart,
    });

  });

export const updateCartItem =
  asyncHandler(async (req, res) => {

    const cart =
      await Cart.findOne({
        user: req.user._id,
      });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message:
          "Cart not found",
      });
    }

    const item =
      cart.items.find(
        (item) =>
          item.product.toString() ===
          req.params.productId
      );

    if (!item) {
      return res.status(404).json({
        success: false,
        message:
          "Item not found",
      });
    }

    item.quantity =
      req.body.quantity;

    await cart.save();

    res.status(200).json({
      success: true,
      message:
        "Cart updated",
      cart,
    });

  });

export const removeCartItem =
  asyncHandler(async (req, res) => {

    const cart =
      await Cart.findOne({
        user: req.user._id,
      });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message:
          "Cart not found",
      });
    }

    cart.items =
      cart.items.filter(
        (item) =>
          item.product.toString() !==
          req.params.productId
      );

    await cart.save();

    res.status(200).json({
      success: true,
      message:
        "Item removed",
      cart,
    });

  });

export const clearCart =
  asyncHandler(async (req, res) => {

    const cart =
      await Cart.findOne({
        user: req.user._id,
      });

    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message:
        "Cart cleared",
    });

  });