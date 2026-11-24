
import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    itemType: {
      type: String,
      enum: ["product", "tool"],
      default: "product",
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },

    tool: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tool",
      default: null,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    selectedColour: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    items: [cartItemSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Cart", cartSchema);
