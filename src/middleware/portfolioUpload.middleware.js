import multer from "multer";

import {
  CloudinaryStorage,
} from "multer-storage-cloudinary";

import cloudinary
from "../config/cloudinary.js";

const storage =
new CloudinaryStorage({

  cloudinary,

  params: async (req, file) => ({

    folder:
      "paint-market/portfolio",

    resource_type:
      file.mimetype.startsWith("video/")
        ? "video"
        : "image",

    allowed_formats: [

      "jpg",

      "jpeg",

      "png",

      "webp",

      "mp4",

      "mov",

      "avi",

      "webm",

    ],

  }),

});

const portfolioUpload =
multer({

  storage,

  limits: {
  fileSize:
    200 *
    1024 *
    1024,
},

  fileFilter:
    (req, file, cb) => {

      const allowedTypes = [

        "image/jpeg",

        "image/png",

        "image/webp",

        "video/mp4",

        "video/quicktime",

        "video/x-msvideo",

        "video/webm",

      ];

      if (
        allowedTypes.includes(
          file.mimetype
        )
      ) {

        cb(null, true);

      } else {

        cb(

          new Error(
            "Only JPG, JPEG, PNG, WEBP, MP4, MOV, AVI and WEBM files are allowed."
          ),

          false

        );

      }

    },

});

export default portfolioUpload;