import multer from "multer";

const storage = multer.memoryStorage();

const painterUpload = multer({
  storage,

  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 8,
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",

      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      "video/webm",
    ];

    if (allowedTypes.includes(file.mimetype)) {
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

export default painterUpload;