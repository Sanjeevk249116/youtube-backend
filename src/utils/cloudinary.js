const { v2: cloudinary } = require("cloudinary");
const fs = require("fs");
require("dotenv").config();

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localPathOfFile) => {
  try {
    if (!localPathOfFile) return null;
    const response = await cloudinary.uploader.upload(localPathOfFile, {
      resource_type: "auto",
    });
    console.log("successfull upload file", response.url);
    return response;
  } catch (error) {
    fs.unlinkSync(localPathOfFile); //remove local file from url
  }
};

module.exports = { uploadOnCloudinary };
