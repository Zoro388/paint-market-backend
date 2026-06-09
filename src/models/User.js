import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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

const User = mongoose.model(
  "User",
  userSchema
);

export default User;