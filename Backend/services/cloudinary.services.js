import cloudinary from '../config/cloudinary.js';

export const uploadFileToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'job_applications/resumes',
    });
    return result.secure_url; 
  } catch (error) {
    throw new Error('Failed to upload file to Cloudinary');
  }
};