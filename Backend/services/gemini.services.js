import { ApiError } from "../utils/Apierror.js";
import { uploadFileToCloudinary } from "./cloudinary.services.js";
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

const parseResume = async (file, jobDesc) => {
  try {
    // Upload the file to Cloudinary and get the URL
    // const resumeUrl = await uploadFileToCloudinary(file.path);
    // console.log("Cloudinary URL:", resumeUrl);

    // Create FormData object
    const formData = new FormData();
    formData.append('resume', fs.createReadStream(file.path), { filename: file.originalname });
    formData.append('job_description', jobDesc);

    // Configure headers for multipart/form-data
    const response = await axios.post("https://interweu-ml.onrender.com/parse_resume", formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    if (response.status !== 200) {
      throw new ApiError(500, "Failed to parse resume");
    }

    return  response.data;
  } catch (error) {
    console.error("Error parsing resume:", error.message);
    throw new ApiError(500, error.message || "Error parsing resume");
  }
};

export default parseResume;
