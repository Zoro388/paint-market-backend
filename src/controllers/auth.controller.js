import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import generateToken from "../utils/generateToken.js";
import crypto from "crypto";
import {  sendPasswordResetEmail,} from "../services/authEmail.service.js";


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


  export const forgotPassword =
  asyncHandler(async (req, res) => {

    const { email } = req.body;

    const user =
      await User.findOne({
        email,
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    const resetToken =
      user.generateResetToken();

    await user.save({
      validateBeforeSave:
        false,
    });

    const resetUrl =
      `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendPasswordResetEmail({
      email: user.email,
      firstName:
        user.firstName,
      resetUrl,
    });

    res.status(200).json({
      success: true,
      message:
        "Password reset email sent successfully",
    });
  });


  export const resetPassword =
  asyncHandler(async (req, res) => {

    const hashedToken =
      crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user =
      await User.findOne({
        resetPasswordToken:
          hashedToken,

        resetPasswordExpire: {
          $gt: Date.now(),
        },
      }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid or expired token",
      });
    }

    const {
      password,
      confirmPassword,
    } = req.body;

    if (
      password !==
      confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Passwords do not match",
      });
    }

    user.password =
      password;

    user.resetPasswordToken =
      undefined;

    user.resetPasswordExpire =
      undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Password reset successfully",
    });
  });




export const checkAuthStatus = async (req, res) => {
  res.status(200).json({
    success: true,
    authenticated: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
};