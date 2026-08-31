import Portfolio from "../models/Portfolio.js";
import asyncHandler from "../utils/asyncHandler.js";

/*
|--------------------------------------------------------------------------
| CREATE PORTFOLIO PROJECT
|--------------------------------------------------------------------------
*/

export const createPortfolio =
asyncHandler(async (
  req,
  res
) => {

  const files =
    req.files || [];

  if (
    files.length === 0
  ) {

    return res.status(400).json({

      success: false,

      message:
        "Please upload at least one image or video.",

    });

  }

  /*
  |--------------------------------------------------------------------------
  | FORMAT MEDIA
  |--------------------------------------------------------------------------
  */

  const media =
    files.map((file) => ({

      type:
        file.mimetype.startsWith("video/")
          ? "video"
          : "image",

      url:
        file.path,

      publicId:
        file.filename || "",

    }));

  /*
  |--------------------------------------------------------------------------
  | CREATE PROJECT
  |--------------------------------------------------------------------------
  */

  const project =
    await Portfolio.create({

      projectTitle:
        req.body.projectTitle,

      projectCategory:
        req.body.projectCategory,

      clientName:
        req.body.clientName,

      projectLocation:
        req.body.projectLocation,

      projectDescription:
        req.body.projectDescription,

      media,

      completionDate:
        req.body.completionDate,

      featured:
        req.body.featured ===
        "true",

    });

  res.status(201).json({

    success: true,

    message:
      "Portfolio project added successfully.",

    project,

  });

});


/*
|--------------------------------------------------------------------------
| GET ALL PORTFOLIOS
|--------------------------------------------------------------------------
*/

export const getPortfolios =
asyncHandler(async (
  req,
  res
) => {

  const projects =
    await Portfolio.find()

      .sort({

        createdAt: -1,

      });

  res.status(200).json({

    success: true,

    count:
      projects.length,

    projects,

  });

});


/*
|--------------------------------------------------------------------------
| GET SINGLE PORTFOLIO
|--------------------------------------------------------------------------
*/

export const getPortfolio =
asyncHandler(async (
  req,
  res
) => {

  const project =
    await Portfolio.findById(
      req.params.id
    );

  if (!project) {

    return res.status(404).json({

      success: false,

      message:
        "Project not found.",

    });

  }

  res.status(200).json({

    success: true,

    project,

  });

});


/*
|--------------------------------------------------------------------------
| UPDATE PORTFOLIO
|--------------------------------------------------------------------------
*/

export const updatePortfolio =
asyncHandler(async (
  req,
  res
) => {

  const project =
    await Portfolio.findById(
      req.params.id
    );

  if (!project) {

    return res.status(404).json({

      success: false,

      message:
        "Project not found.",

    });

  }

  /*
  |--------------------------------------------------------------------------
  | UPDATE BASIC DETAILS
  |--------------------------------------------------------------------------
  */

  project.projectTitle =
    req.body.projectTitle ??
    project.projectTitle;

  project.projectCategory =
    req.body.projectCategory ??
    project.projectCategory;

  project.clientName =
    req.body.clientName ??
    project.clientName;

  project.projectLocation =
    req.body.projectLocation ??
    project.projectLocation;

  project.projectDescription =
    req.body.projectDescription ??
    project.projectDescription;

  project.completionDate =
    req.body.completionDate ??
    project.completionDate;

  /*
  |--------------------------------------------------------------------------
  | FEATURED
  |--------------------------------------------------------------------------
  */

  if (
    req.body.featured !==
    undefined
  ) {

    project.featured =
      req.body.featured ===
      "true" ||

      req.body.featured ===
      true;

  }

  /*
  |--------------------------------------------------------------------------
  | ADD NEW MEDIA
  |--------------------------------------------------------------------------
  */

  const files =
    req.files || [];

  if (
    files.length > 0
  ) {

    const newMedia =
      files.map(
        (file) => ({

          type:
            file.mimetype.startsWith(
              "video/"
            )

              ? "video"

              : "image",

          url:
            file.path,

          publicId:
            file.filename || "",

        })
      );

    project.media.push(
      ...newMedia
    );

  }

  await project.save();

  res.status(200).json({

    success: true,

    message:
      "Portfolio project updated successfully.",

    project,

  });

});


/*
|--------------------------------------------------------------------------
| DELETE PORTFOLIO PROJECT
|--------------------------------------------------------------------------
*/

export const deletePortfolio =
asyncHandler(async (
  req,
  res
) => {

  const project =
    await Portfolio.findById(
      req.params.id
    );

  if (!project) {

    return res.status(404).json({

      success: false,

      message:
        "Project not found.",

    });

  }

  await project.deleteOne();

  res.status(200).json({

    success: true,

    message:
      "Project deleted successfully.",

  });

});