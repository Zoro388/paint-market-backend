import Portfolio from "../models/Portfolio.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createPortfolio =
asyncHandler(async (
req,
res
) => {

try {

const imageUrls =
req.files?.map(
(file)=>
file.path
) || [];

if (
imageUrls.length === 0
) {
return res.status(400).json({

success:false,

message:
"Please upload at least one image",

});
}

const project =
await Portfolio.create({ projectTitle:
req.body.projectTitle,
projectCategory:
req.body.projectCategory,

clientName:
req.body.clientName,

projectLocation:
req.body.projectLocation,

projectDescription:
req.body.projectDescription,

images:
imageUrls,

completionDate:
req.body.completionDate,

featured:
req.body.featured ===
"true",

});

res.status(201).json({

success:true,

message:
"Project added successfully",

project,

});

} catch (error) {

console.error(
"CREATE PORTFOLIO ERROR:",
error
);

res.status(500).json({

success:false,

message:
error.message,

});

}

});
export const getPortfolios =
  asyncHandler(async (req, res) => {
    const projects =
      await Portfolio.find().sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  });

export const getPortfolio =
  asyncHandler(async (req, res) => {
    const project =
      await Portfolio.findById(
        req.params.id
      );

    if (!project) {
      return res.status(404).json({
        success: false,
        message:
          "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      project,
    });
  });

export const updatePortfolio =
  asyncHandler(async (req, res) => {
    const project =
      await Portfolio.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!project) {
      return res.status(404).json({
        success: false,
        message:
          "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Project updated successfully",
      project,
    });
  });

export const deletePortfolio =
  asyncHandler(async (req, res) => {
    const project =
      await Portfolio.findById(
        req.params.id
      );

    if (!project) {
      return res.status(404).json({
        success: false,
        message:
          "Project not found",
      });
    }

    await project.deleteOne();

    res.status(200).json({
      success: true,
      message:
        "Project deleted successfully",
    });
  });