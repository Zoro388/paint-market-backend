import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

const allowedVideoTypes = [
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
  "video/webm",
];

const allowedImageExtensions = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".bmp",
  ".tif",
  ".tiff",
  ".avif",
  ".svg",
  ".ico",
];

const painterUpload = multer({
  storage,

  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 8,
  },

  fileFilter: (req, file, cb) => {
    const mimetype = file.mimetype?.toLowerCase() || "";
    const extension = path
      .extname(file.originalname || "")
      .toLowerCase();

    /*
    |--------------------------------------------------------------------------
    | ACCEPT ANY IMAGE MIME TYPE
    |--------------------------------------------------------------------------
    */

    if (mimetype.startsWith("image/")) {
      return cb(null, true);
    }

    /*
    |--------------------------------------------------------------------------
    | ACCEPT IMAGE FILES EVEN IF THEIR MIME TYPE IS GENERIC
    |--------------------------------------------------------------------------
    */

    if (allowedImageExtensions.includes(extension)) {
      return cb(null, true);
    }

    /*
    |--------------------------------------------------------------------------
    | ACCEPT SUPPORTED VIDEO TYPES
    |--------------------------------------------------------------------------
    */

    if (allowedVideoTypes.includes(mimetype)) {
      return cb(null, true);
    }

    /*
    |--------------------------------------------------------------------------
    | REJECT EVERYTHING ELSE
    |--------------------------------------------------------------------------
    */

    return cb(
      new Error(
        "Only image files and supported video files are allowed."
      ),
      false
    );
  },
});

export default painterUpload;