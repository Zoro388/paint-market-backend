import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import generateToken from "../utils/generateToken.js";

export const signup =
  asyncHandler(async (req, res) => {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phoneNumber ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All fields are required.",
      });
    }

    const existingUser =
      await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "Email already exists.",
      });
    }

    const user =
      await User.create({
        firstName,
        lastName,
        email,
        phoneNumber,
        password,
      });

    const token =
      generateToken(user._id);

    return res.status(201).json({
      success: true,
      message:
        "Account created successfully.",
      token,
      user: {
        id: user._id,
        firstName:
          user.firstName,
        lastName:
          user.lastName,
        email: user.email,
      },
    });
  });

export const login =
  asyncHandler(async (req, res) => {
    const { email, password } =
      req.body;

    const user =
      await User.findOne({
        email,
      }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    const isMatch =
      await user.comparePassword(
        password
      );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    const token =
      generateToken(user._id);

    return res.status(200).json({
      success: true,
      message:
        "Login successful.",
      token,
      user,
    });
  });

export const logout =
  asyncHandler(async (req, res) => {
    return res.status(200).json({
      success: true,
      message:
        "Logout successful.",
    });
  });

export const changePassword =
  asyncHandler(async (req, res) => {
    const {
      currentPassword,
      newPassword,
    } = req.body;

    const user =
      await User.findById(
        req.user._id
      ).select("+password");

    const isMatch =
      await user.comparePassword(
        currentPassword
      );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message:
          "Current password is incorrect.",
      });
    }

    user.password =
      newPassword;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password updated successfully.",
    });
  });