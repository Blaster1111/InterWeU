import Job from "../model/job.model.js";
import JobApplication from "../model/jobApplication.model.js";
import { ApiError } from "../utils/Apierror.js";
import { apiResponse } from "../utils/APIresponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createJobApplication = asyncHandler(async (req, res) => {
  const authenticatedUser = verifyJWT(req);
  if (!authenticatedUser) {
    throw new ApiError(401, "Unauthenticated User");
  }

  const { jobId, coverLetter } = req.body;
  const job = await Job.findById(jobId);
  if (!job || job.status === "closed") {
    throw new ApiError(404, "Job Not Found");
  }

  const jobDescription = job.description;

  if (!req.file) {
    throw new ApiError(400, "Resume file is required");
  }

  const { resumeUrl, parsedData } = await parseResume(req.file.path, jobDescription);

  const { parsed_content, gemini_response } = parsedData;
  
  const jobApplication = new JobApplication({
    jobId,
    coverLetter,
    applicantId: authenticatedUser._id,
    resume: resumeUrl,
    atsScore: gemini_response.ats_score,
    strengths: gemini_response.strengths,
    parsedContent: parsed_content,
  });

  await jobApplication.save();
  res.status(201).json(new apiResponse(201, jobApplication, "Job Application Submitted Successfully"));
});

const updateJobApplicationStatus = asyncHandler(async(req,res)=>{
    const authenticatedUser = verifyJWT(req);
  if(!authenticatedUser){
    throw new ApiError(401,"Unauthenticated User");
  }
    const {status} = req.body;
    const jobApplication = await JobApplication.findById(authenticatedUser._id);
    if(!jobApplication){
        throw new ApiError(404,"Job Application not found");
    }
    jobApplication.status = status;
    await jobApplication.save();
    res.status(200).json(new apiResponse(200,jobApplication,"Job Application Status Updated Successully"));
});

export{
    createJobApplication,
    updateJobApplicationStatus,
}