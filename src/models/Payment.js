import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | USER
    |--------------------------------------------------------------------------
    */

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | ORDER
    |--------------------------------------------------------------------------
    */

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | FLUTTERWAVE REFERENCE
    |--------------------------------------------------------------------------
    */

    reference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | FLUTTERWAVE TRANSACTION ID
    |--------------------------------------------------------------------------
    */

    transactionId: {
      type: String,
      default: "",
    },

    /*
    |--------------------------------------------------------------------------
    | PAYMENT AMOUNT
    |--------------------------------------------------------------------------
    */

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | CUSTOMER EMAIL
    |--------------------------------------------------------------------------
    */

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    /*
    |--------------------------------------------------------------------------
    | PAYMENT STATUS
    |--------------------------------------------------------------------------
    */

    status: {
      type: String,
      enum: [
        "pending",
        "success",
        "failed",
      ],
      default: "pending",
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | PAYMENT METHOD
    |--------------------------------------------------------------------------
    */

    paymentMethod: {
      type: String,
      default: "flutterwave",
    },

    /*
    |--------------------------------------------------------------------------
    | PAYMENT DATE
    |--------------------------------------------------------------------------
    */

    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model(
  "Payment",
  paymentSchema
);

export default Payment;