import multer from "multer";

const memoryStorage = multer.memoryStorage();

const mediaUpload = multer({
  storage: memoryStorage,

  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB maximum per file
  },
});

export default mediaUpload;