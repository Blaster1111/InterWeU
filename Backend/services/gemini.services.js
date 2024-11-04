import { ApiError } from "../utils/Apierror.js";
import { uploadFileToCloudinary } from "./cloudinary.services.js";
import axios from 'axios';

const parseResume = async (filePath, jobDesc) => {
  try {
    const resumeUrl = await uploadFileToCloudinary(filePath.path);
    console.log(resumeUrl);
    const formData = new FormData();
    formData.append('resume', filePath.path);
    formData.append('job_description', jobDesc);

    const response = await axios.post("https://interweu-ml.onrender.com/parse_resume", formData, {
      headers: {
        'Content-Type': 'multipart/form-data', 
      },
    });

    if (response.status !== 200) {
      throw new ApiError(500, "Failed to parse resume");
    }

    return { resumeUrl, parsedData: response.data };
  } catch (error) {
    throw new ApiError(500, error.message || "Error parsing resume");
  }
};

export default parseResume;