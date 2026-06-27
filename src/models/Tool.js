import mongoose from "mongoose";

const toolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

images: {
  type: [String],
  validate: {
    validator: (value) =>
      value.length >= 1 && value.length <= 3,
    message:
      "A tool must have between 1 and 3 images",
  },
}
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Tool",
  toolSchema
);