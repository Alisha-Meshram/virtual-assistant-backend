import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
export const uploadCloudinary = async (filePath) => {
  // Configuration
  cloudinary.config({
    cloud_name: process.env.Cloudinary_cloud_name,
    api_key: process.env.Cloudinary_api_key,
    api_secret: process.env.Cloudinary_api_secret, // Click 'View API Keys' above to copy your API secret
  });

  try {
    // Upload an image
    const uploadResult = await cloudinary.uploader.upload(filePath);
    fs.unlinkSync(filePath);

    return uploadResult.secure_url;
  } catch (error) {
    fs.unlinkSync(filePath);
    console.log("Cloudinary Error:", error);
  }
};
