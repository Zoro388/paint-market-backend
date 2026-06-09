import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

// export const getProfile =
//   asyncHandler(async (req, res) => {
//     res.status(200).json({
//       success: true,
//       user: req.user,
//     });
//   });

// export const updateProfile =
//   asyncHandler(async (req, res) => {
//     const user =
//       await User.findById(
//         req.user._id
//       );

//     user.firstName =
//       req.body.firstName ||
//       user.firstName;

//     user.lastName =
//       req.body.lastName ||
//       user.lastName;

//     user.phoneNumber =
//       req.body.phoneNumber ||
//       user.phoneNumber;

//     await user.save();

//     res.status(200).json({
//       success: true,
//       user,
//     });
//   });

export const getProfile = asyncHandler(
  async (req, res) => {
    const user = await User.findById(
      req.user._id
    ).select("-password");

    res.status(200).json({
      success: true,
      user,
    });
  }
);

export const updateProfile =
  asyncHandler(async (req, res) => {
    const user = await User.findById(
      req.user._id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.firstName =
      req.body.firstName ||
      user.firstName;

    user.lastName =
      req.body.lastName ||
      user.lastName;

    user.phoneNumber =
      req.body.phoneNumber ||
      user.phoneNumber;

    if (req.body.profileImage) {
      user.profileImage =
        req.body.profileImage;
    }

    const updatedUser =
      await user.save();

    res.status(200).json({
      success: true,
      message:
        "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        firstName:
          updatedUser.firstName,
        lastName:
          updatedUser.lastName,
        email: updatedUser.email,
        phoneNumber:
          updatedUser.phoneNumber,
        profileImage:
          updatedUser.profileImage,
      },
    });
  });