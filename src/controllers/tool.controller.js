// import Tool from "../models/Tool.js";
// import asyncHandler from "../utils/asyncHandler.js";
// import cloudinary from "../config/cloudinary.js";
// // import streamifier from "streamifier";
// import { uploadBuffer, deleteFile } from "../utils/cloudinaryUpload.js";

// export const createTool =
// asyncHandler(async (req, res) => {

//   const {
//     name,
//     description,
//   } = req.body;

//   if (!name || !description) {
//     return res.status(400).json({
//       success: false,
//       message:
//         "Name and description are required",
//     });
//   }

//   if (
//     !req.files ||
//     req.files.length === 0
//   ) {
//     return res.status(400).json({
//       success: false,
//       message:
//         "Please upload at least one image.",
//     });
//   }

//   if (req.files.length > 3) {
//     return res.status(400).json({
//       success: false,
//       message:
//         "Maximum of 3 images allowed.",
//     });
//   }

//   const uploadedImages = [];

//   for (const file of req.files) {

//     const result =
//       await uploadBuffer(
//         file,
//         "paintmarket/tools"
//       );

//     uploadedImages.push(
//       result.secure_url
//     );

//   }

//   const tool =
//     await Tool.create({

//       name,

//       description,

//       images:
//         uploadedImages,

//     });

//   res.status(201).json({

//     success: true,

//     message:
//       "Tool created successfully.",

//     tool,

//   });

// });



//   export const getTools =
//   asyncHandler(async (req, res) => {

//     const tools =
//       await Tool.find()
//       .sort({
//         createdAt: -1,
//       });

//     res.status(200).json({
//       success: true,
//       count: tools.length,
//       tools,
//     });

//   });

//   export const getTool =
//   asyncHandler(async (req, res) => {

//     const tool =
//       await Tool.findById(
//         req.params.id
//       );

//     if (!tool) {
//       return res.status(404).json({
//         success: false,
//         message:
//           "Tool not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       tool,
//     });

//   });


// export const updateTool =
//   asyncHandler(async (req, res) => {

//     const tool =
//       await Tool.findById(req.params.id);

//     if (!tool) {
//       return res.status(404).json({
//         success: false,
//         message: "Tool not found",
//       });
//     }

//     const {
//       name,
//       description,
//     } = req.body;

//     if (name) {
//       tool.name = name;
//     }

//     if (description) {
//       tool.description = description;
//     }

//     // Only replace images if new ones were uploaded
//     if (
//       req.files &&
//       req.files.length > 0
//     ) {

//       const uploadedImages = [];

//       for (const file of req.files) {

//         const result =
// await uploadBuffer(
//   file,
//   "paintmarket/tools"
// );

//         uploadedImages.push(
//           result.secure_url
//         );
//       }

//       tool.images =
//         uploadedImages;
//     }

//     await tool.save();

//     res.status(200).json({
//       success: true,
//       message:
//         "Tool updated successfully",
//       tool,
//     });

//   });

//   export const deleteTool =
//   asyncHandler(async (req, res) => {

//     const tool =
//       await Tool.findById(req.params.id);

//     if (!tool) {
//       return res.status(404).json({
//         success: false,
//         message: "Tool not found",
//       });
//     }

//     // Delete images from Cloudinary
//     if (tool.images && tool.images.length > 0) {

//       for (const image of tool.images) {

//         // Extract public_id from URL
//         const publicId =
//           image
//             .split("/")
//             .slice(-2)
//             .join("/")
//             .split(".")[0];

//         await deleteFile(publicId);

//       }

//     }

//     await tool.deleteOne();

//     res.status(200).json({
//       success: true,
//       message: "Tool deleted successfully",
//     });

//   });





import Tool from "../models/Tool.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadBuffer, deleteFile } from "../utils/cloudinaryUpload.js";

// CREATE TOOL
export const createTool = asyncHandler(async (req, res) => {
  const { name, description, price } = req.body;

  const toolPrice = Number(price);

  if (!name || !description) {
    return res.status(400).json({
      success: false,
      message: "Name and description are required",
    });
  }

  if (
    price === undefined ||
    price === null ||
    price === "" ||
    !Number.isFinite(toolPrice) ||
    toolPrice <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "A valid tool price greater than zero is required",
    });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Please upload at least one image.",
    });
  }

  if (req.files.length > 3) {
    return res.status(400).json({
      success: false,
      message: "Maximum of 3 images allowed.",
    });
  }

  const uploadedImages = [];

  for (const file of req.files) {
    const result = await uploadBuffer(
      file,
      "paintmarket/tools"
    );

    uploadedImages.push(result.secure_url);
  }

  const tool = await Tool.create({
    name,
    description,
    price: toolPrice,
    images: uploadedImages,
  });

  res.status(201).json({
    success: true,
    message: "Tool created successfully.",
    tool,
  });
});


// GET ALL TOOLS
export const getTools = asyncHandler(async (req, res) => {
  const tools = await Tool.find().sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    count: tools.length,
    tools,
  });
});


// GET SINGLE TOOL
export const getTool = asyncHandler(async (req, res) => {
  const tool = await Tool.findById(req.params.id);

  if (!tool) {
    return res.status(404).json({
      success: false,
      message: "Tool not found",
    });
  }

  res.status(200).json({
    success: true,
    tool,
  });
});


// UPDATE TOOL
export const updateTool = asyncHandler(async (req, res) => {
  const tool = await Tool.findById(req.params.id);

  if (!tool) {
    return res.status(404).json({
      success: false,
      message: "Tool not found",
    });
  }

  const { name, description, price } = req.body;

  if (name !== undefined && name.trim() !== "") {
    tool.name = name;
  }

  if (description !== undefined && description.trim() !== "") {
    tool.description = description;
  }

  if (price !== undefined && price !== "") {
    const toolPrice = Number(price);

    if (!Number.isFinite(toolPrice) || toolPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Tool price must be greater than zero",
      });
    }

    tool.price = toolPrice;
  }

  // Replace images only when new images are uploaded
  if (req.files && req.files.length > 0) {
    if (req.files.length > 3) {
      return res.status(400).json({
        success: false,
        message: "Maximum of 3 images allowed.",
      });
    }

    const uploadedImages = [];

    for (const file of req.files) {
      const result = await uploadBuffer(
        file,
        "paintmarket/tools"
      );

      uploadedImages.push(result.secure_url);
    }

    tool.images = uploadedImages;
  }

  await tool.save();

  res.status(200).json({
    success: true,
    message: "Tool updated successfully",
    tool,
  });
});


// DELETE TOOL
export const deleteTool = asyncHandler(async (req, res) => {
  const tool = await Tool.findById(req.params.id);

  if (!tool) {
    return res.status(404).json({
      success: false,
      message: "Tool not found",
    });
  }

  // Delete images from Cloudinary
  if (tool.images && tool.images.length > 0) {
    for (const image of tool.images) {
      const publicId = image
        .split("/")
        .slice(-2)
        .join("/")
        .split(".")[0];

      await deleteFile(publicId);
    }
  }

  await tool.deleteOne();

  res.status(200).json({
    success: true,
    message: "Tool deleted successfully",
  });
});
