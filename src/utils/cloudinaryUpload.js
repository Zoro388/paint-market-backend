import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

/*
|--------------------------------------------------------------------------
| Upload Buffer To Cloudinary
|--------------------------------------------------------------------------
*/

export const uploadBuffer = (
  file,
  folder,
  resourceType = "image"
) => {
  return new Promise((resolve, reject) => {

    const stream =
      cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
        },
        (error, result) => {

          if (error) {
            return reject(error);
          }

          resolve(result);

        }
      );

    streamifier
      .createReadStream(file.buffer)
      .pipe(stream);

  });
};

/*
|--------------------------------------------------------------------------
| Delete File From Cloudinary
|--------------------------------------------------------------------------
*/

export const deleteFile = async (
  publicId,
  resourceType = "image"
) => {

  return cloudinary.uploader.destroy(
    publicId,
    {
      resource_type: resourceType,
    }
  );

};