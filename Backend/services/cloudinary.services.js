import cloudinary from '../utils/cloudinary.js';

export const uploadFileToCloudinary = async (filePath) => {
  try {
    console.log("File path for upload:", filePath);
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'job_applications/resumes',
    });
    return result.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error('Failed to upload file to Cloudinary');
  }
};