import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema =
  new mongoose.Schema(
    {
      firstName: {
        type: String,
        required: true,
        trim: true,
      },

      lastName: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
      },

      phoneNumber: {
        type: String,
        required: true,
      },

      password: {
        type: String,
        required: true,
        minlength: 6,
        select: false,
      },

      profileImage: {
        type: String,
        default: "",
      },

      role: {
        type: String,
        enum: [
          "customer",
          "admin",
        ],
        default: "customer",
      },

      // NEW
      resetPasswordToken: {
        type: String,
      },

      // NEW
      resetPasswordExpire: {
        type: Date,
      },
    },
    {
      timestamps: true,
    }
  );

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(
    this.password,
    10
  );
});

userSchema.methods.comparePassword =
  async function (password) {
    return bcrypt.compare(
      password,
      this.password
    );
  };

// NEW
userSchema.methods.generateResetToken =
  function () {
    const resetToken =
      crypto
        .randomBytes(32)
        .toString("hex");

    this.resetPasswordToken =
      crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    this.resetPasswordExpire =
      Date.now() +
      15 * 60 * 1000;

    return resetToken;
  };

const User = mongoose.model(
  "User",
  userSchema
);

export default User;