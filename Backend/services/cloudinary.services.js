import cloudinary from '../utils/cloudinary.js';

export const uploadFileToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'job_applications/resumes',
      public_id: `resume_${Date.now()}`,
      resource_type: 'auto',
      upload_preset: 'public_access'
    });
    return result.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error('Failed to upload file to Cloudinary');
  }
};