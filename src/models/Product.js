import mongoose from "mongoose";

const questionSchema =
  new mongoose.Schema(
    {
      question: {
        type: String,
        required: true,
        trim: true,
      },

      answer: {
        type: String,
        required: true,
        trim: true,
      },
    },
    {
      _id: false,
    }
  );

const productSchema =
  new mongoose.Schema(
    {
      productName: {
        type: String,
        required: true,
        trim: true,
      },

      productCategory: {
        type: String,
        required: true,
      },

      productDescription: {
        type: String,
        required: true,
      },

      productImages: [
        {
          type: String,
        },
      ],

      colourCode: {
        type: String,
      },

      colourName: {
        type: String,
      },

      // NEW
      hex: {
        type: String,
        default: "",
      },

      price: {
        type: Number,
        required: true,
      },

      stockQuantity: {
        type: Number,
        default: 0,
      },

      coverageInformation: {
        type: String,
      },

      productFeatures: [
        {
          type: String,
        },
      ],

      // NEW
      questions: {
        type: [questionSchema],
        default: [],
      },

      status: {
        type: String,
        enum: [
          "active",
          "inactive",
        ],
        default: "active",
      },
    },
    {
      timestamps: true,
    }
  );

const Product =
  mongoose.model(
    "Product",
    productSchema
  );

export default Product;