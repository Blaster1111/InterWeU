import Job from "../model/job.model.js";
import JobApplication from "../model/jobApplication.model.js";
import { ApiError } from "../utils/Apierror.js";
import { apiResponse } from "../utils/APIresponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import parseResume from "../services/gemini.services.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const createJobApplication = asyncHandler(async (req, res) => {
  const authenticatedUser = await verifyJWT(req);
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
  const  parsedData  = await parseResume(req.file, jobDescription);
  const jobApplication = new JobApplication({
    jobId,
    coverLetter,
    applicantId: authenticatedUser._id,
    resume: "hi",
    atsScore: parsedData.data.gemini_response.ats_score,
    parsedContent: parsedData.data.gemini_response.full_response,
    strengths: parsedData.data.gemini_response.strengths,
    parsedResume: {
      skills: parsedData.data.parsed_content.skills,
      education: parsedData.data.parsed_content.education,
      projects: parsedData.data.parsed_content.projects,
      experience: parsedData.data.parsed_content.experience,
    },

  });

  await jobApplication.save();
  res.status(201).json(new apiResponse(201, jobApplication, "Job Application Submitted Successfully"));
});


const updateJobApplicationStatus = asyncHandler(async (req, res) => {
  const authenticatedUser = await verifyJWT(req);
  if (!authenticatedUser) {
    throw new ApiError(401, "Unauthenticated User");
  }

  const { id } = req.params; 
  const { status } = req.body;
  const jobApplication = await JobApplication.findById(id);
  if (!jobApplication) {
    throw new ApiError(404, "Job Application not found");
  }

  jobApplication.status = status;
  await jobApplication.save();

  res.status(200).json(new apiResponse(200, jobApplication, "Job Application Status Updated Successfully"));
});

const getCandidateApplications = asyncHandler(async(req,res)=>{
  const authenticatedUser = await verifyJWT(req);
  if (!authenticatedUser) {
    throw new ApiError(401, "Unauthenticated User");
  }
  const applications = await JobApplication.find({applicantId:authenticatedUser._id});
  console.log(applications.length)
  res.status(200).json(new apiResponse(200,applications,"Candidates Job Applications retrieved successfully"));
})

export{
    createJobApplication,
    updateJobApplicationStatus,
    getCandidateApplications,
}