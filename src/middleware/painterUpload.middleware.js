import multer from "multer";

const storage = multer.memoryStorage();

const painterUpload = multer({
  storage,

  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 8,
  },

  fileFilter: (req, file, cb) => {
    const allowedVideoTypes = [
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      "video/webm",
    ];

    /*
    |--------------------------------------------------------------------------
    | ACCEPT ANY IMAGE TYPE
    |--------------------------------------------------------------------------
    */

    if (file.mimetype.startsWith("image/")) {
      return cb(null, true);
    }

    /*
    |--------------------------------------------------------------------------
    | ACCEPT SUPPORTED VIDEO TYPES
    |--------------------------------------------------------------------------
    */

    if (allowedVideoTypes.includes(file.mimetype)) {
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