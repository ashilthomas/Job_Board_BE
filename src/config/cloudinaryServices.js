
import { v2 as cloudinary } from 'cloudinary';
import "dotenv/config"


// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload an image to Cloudinary
 * @param {string} filePath - Path to the file
 * @param {Object} options - Optional upload options
 * @returns {Promise<Object>}
 */
const uploadToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath);
    return result;
  } catch (error) {
    throw new Error('Cloudinary upload failed: ' + error.message);
  }
};

export default uploadToCloudinary