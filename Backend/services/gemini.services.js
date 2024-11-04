import JobApplication from "../model/jobApplication.model";
import { ApiError } from "../utils/Apierror";
import { uploadFileToCloudinary } from "./cloudinary.services"

const parseResume = async (filePath, jobDesc) => {
    try {
      const resumeUrl = await uploadFileToCloudinary(filePath);
      const response = await axios.post("https://interweu-ml.onrender.com/parse_resume", {
        resume: resumeUrl,
        job_description: jobDesc,
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