import Product from "../models/Product.js";
import asyncHandler from "../utils/asyncHandler.js";
import cloudinary from "../config/cloudinary.js";

export const createProduct =
  asyncHandler(async (req, res) => {

    if (
      !req.files ||
      req.files.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please upload at least one product image",
      });
    }

    const uploadedImages = [];

    for (const file of req.files) {

      const result =
        await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
          {
            folder:
              "paint-market/products",
          }
        );

      uploadedImages.push(
        result.secure_url
      );
    }

    let questions = [];

    if (req.body.questions) {
      questions = JSON.parse(
        req.body.questions
      );
    }

    let productFeatures = [];

    if (
      req.body.productFeatures
    ) {
      productFeatures =
        JSON.parse(
          req.body.productFeatures
        );
    }

    const product =
      await Product.create({

        productName:
          req.body.productName,

        productCategory:
          req.body.productCategory,

        productDescription:
          req.body.productDescription,

        colourCode:
          req.body.colourCode,

        colourName:
          req.body.colourName,

        hex:
          req.body.hex,

        price:
          Number(req.body.price),

        stockQuantity:
          Number(
            req.body.stockQuantity
          ),

        coverageInformation:
          req.body.coverageInformation,

        productFeatures,

        questions,

        status:
          req.body.status,

        productImages:
          uploadedImages,

      });

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

    product.productName =
      req.body.productName ||
      product.productName;

    product.productCategory =
      req.body.productCategory ||
      product.productCategory;

    product.productDescription =
      req.body.productDescription ||
      product.productDescription;

    product.colourCode =
      req.body.colourCode ||
      product.colourCode;

    product.colourName =
      req.body.colourName ||
      product.colourName;

    product.hex =
      req.body.hex ||
      product.hex;

    product.price =
      req.body.price ||
      product.price;

    product.stockQuantity =
      req.body.stockQuantity ||
      product.stockQuantity;

    product.coverageInformation =
      req.body.coverageInformation ||
      product.coverageInformation;

    product.status =
      req.body.status ||
      product.status;

    if (
      req.body.questions
    ) {

      product.questions =
        JSON.parse(
          req.body.questions
        );

    }

    if (
      req.body.productFeatures
    ) {

      product.productFeatures =
        JSON.parse(
          req.body.productFeatures
        );

    }

    if (
      req.files &&
      req.files.length > 0
    ) {

      const uploadedImages = [];

      for (const file of req.files) {

        const result =
          await cloudinary.uploader.upload(
            `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
            {
              folder:
                "paint-market/products",
            }
          );

        uploadedImages.push(
          result.secure_url
        );

      }

      product.productImages =
        uploadedImages;

    }

    await product.save();

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