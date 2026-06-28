import multer from "multer";

const memoryStorage = multer.memoryStorage();

const mediaUpload = multer({
  storage: memoryStorage,

  limits: {
    fileSize:
      50 *
      1024 *
      1024, // 50MB
  },
});

export default mediaUpload;