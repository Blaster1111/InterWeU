import { ApiError } from "../utils/Apierror.js";
import { uploadFileToCloudinary } from "./cloudinary.services.js"
import axios from 'axios';

const parseResume = async (filePath, jobDesc) => {
    try {
      const resumeUrl = await uploadFileToCloudinary(filePath);
      console.log("here");
      const response = await axios.post("https://interweu-ml.onrender.com/parse_resume", {
        resume: resumeUrl,
        job_description: jobDesc,
      });
      console.log(response);
      if (response.status !== 200) {
        throw new ApiError(500, "Failed to parse resume");
      }
      console.log("here");
      return { resumeUrl, parsedData: response.data };
    } catch (error) {
      throw new ApiError(500, error.message || "Error parsing resume");
    }
  };
  

export default parseResume;