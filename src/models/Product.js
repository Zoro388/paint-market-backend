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

const variantSchema =
  new mongoose.Schema(
    {
      colourName: {
        type: String,
        required: true,
        trim: true,
      },

      colourCode: {
        type: String,
        required: true,
        trim: true,
      },

      image: {
        url: {
          type: String,
          required: true,
        },

        publicId: {
          type: String,
          required: true,
        },
      },
    },
    {
      _id: true,
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

      /*
      |--------------------------------------------------------------------------
      | Bucket Images
      |--------------------------------------------------------------------------
      */

      productImages: [
        {
          type: String,
        },
      ],

      /*
      |--------------------------------------------------------------------------
      | Available Colour Variants
      |--------------------------------------------------------------------------
      */

      variants: {
        type: [variantSchema],
        default: [],
      },

      price: {
        type: Number,
        required: true,
      },

      coverageInformation: {
        type: String,
      },

      productFeatures: [
        {
          type: String,
        },
      ],

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