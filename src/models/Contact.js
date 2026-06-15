import mongoose from "mongoose";

const contactSchema =
  new mongoose.Schema(
    {
      fullName: {
        type: String,
        required: true,
      },

      email: {
        type: String,
        required: true,
      },

      phoneNumber: {
        type: String,
      },

      subject: {
        type: String,
        required: true,
      },

      message: {
        type: String,
        required: true,
      },

      adminResponse: {
        type: String,
        default: "",
      },

      responseDate: {
        type: Date,
      },

      status: {
        type: String,
        enum: [
          "pending",
          "reviewed",
          "responded",
          "closed",
        ],
        default: "pending",
      },
    },
    {
      timestamps: true,
    }
  );

const Contact = mongoose.model(
  "Contact",
  contactSchema
);

export default Contact;