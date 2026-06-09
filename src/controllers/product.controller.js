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