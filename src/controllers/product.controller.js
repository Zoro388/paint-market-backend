import Product from "../models/Product.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createProduct =
  asyncHandler(async (req, res) => {
    const product =
      await Product.create(
        req.body
      );

    res.status(201).json({
      success: true,
      message:
        "Product created successfully",
      product,
    });
  });

export const getProducts =
  asyncHandler(async (req, res) => {
    const products =
      await Product.find();

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  });

export const getProduct =
  asyncHandler(async (req, res) => {
    const product =
      await Product.findById(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  });

export const updateProduct =
  asyncHandler(async (req, res) => {
    const product =
      await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      );

    res.status(200).json({
      success: true,
      message:
        "Product updated successfully",
      product,
    });
  });

export const deleteProduct =
  asyncHandler(async (req, res) => {
    const product =
      await Product.findById(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found",
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message:
        "Product deleted successfully",
    });
  });

  
  export const increaseProductStock =
  asyncHandler(async (req, res) => {

    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than zero",
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.stockQuantity += Number(quantity);

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product stock increased successfully",
      product,
    });

  });

  export const decreaseProductStock =
  asyncHandler(async (req, res) => {

    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than zero",
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.stockQuantity < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock available",
      });
    }

    product.stockQuantity -= Number(quantity);

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product stock decreased successfully",
      product,
    });

  });