import SiteSettings from "../models/SiteSettings.js";
import asyncHandler from "../utils/asyncHandler.js";
import cloudinary from "../config/cloudinary.js";

/*
|--------------------------------------------------------------------------
| GET WEBSITE SETTINGS
|--------------------------------------------------------------------------
*/

export const getSiteSettings =
  asyncHandler(async (req, res) => {

    let settings =
      await SiteSettings.findOne();

    if (!settings) {
      settings =
        await SiteSettings.create({});
    }

    res.status(200).json({
      success: true,
      settings,
    });

  });

/*
|--------------------------------------------------------------------------
| Upload Helper
|--------------------------------------------------------------------------
*/

const uploadToCloudinary = (
  file,
  folder
) => {

  return new Promise(
    (resolve, reject) => {

      cloudinary.uploader
        .upload_stream(
          {
            folder,
          },
          (error, result) => {

            if (error)
              return reject(error);

            resolve(result);

          }
        )
        .end(file.buffer);

    }
  );

};

/*
|--------------------------------------------------------------------------
| UPDATE WEBSITE SETTINGS
|--------------------------------------------------------------------------
*/

export const updateSiteSettings =
  asyncHandler(async (req, res) => {

    let settings =
      await SiteSettings.findOne();

    if (!settings) {
      settings =
        await SiteSettings.create({});
    }

    /*
    |--------------------------------------------------------------------------
    | Image Fields
    |--------------------------------------------------------------------------
    */

    const imageFields = [
      "logo",
      "favicon",
      "heroImage",
      "heroBanner",
      "aboutImage",
      "aboutBanner",
      "footerLogo",
      "shopBanner",
      "newsletterBanner",
      "contactBanner",
      "ogImage",
    ];

    /*
    |--------------------------------------------------------------------------
    | Upload Images
    |--------------------------------------------------------------------------
    */

    for (const field of imageFields) {

      if (req.files?.[field]?.length) {

        const uploaded =
          await uploadToCloudinary(
            req.files[field][0],
            "paint-market/settings"
          );

        settings[field] =
          uploaded.secure_url;

      }

    }

    /*
    |--------------------------------------------------------------------------
    | Update Text / Colors / Links / Booleans
    |--------------------------------------------------------------------------
    */

    Object.keys(req.body).forEach((key) => {

      let value =
        req.body[key];

      /*
      |--------------------------------------------------------------------------
      | Convert Boolean Strings
      |--------------------------------------------------------------------------
      */

      if (value === "true")
        value = true;

      if (value === "false")
        value = false;

      settings[key] = value;

    });

    await settings.save();

    res.status(200).json({
      success: true,
      message:
        "Website settings updated successfully",
      settings,
    });

  });