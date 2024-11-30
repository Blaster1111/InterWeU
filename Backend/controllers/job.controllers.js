import Job from "../model/job.model.js";
import { ApiError } from "../utils/Apierror.js";
import { apiResponse } from "../utils/APIresponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const createJob = asyncHandler(async (req, res) => {
  const authenticatedUser = await verifyJWT(req);
  if (!authenticatedUser) {
    throw new ApiError(401, "Unauthenticated User");
  }
  const {
    title,
    description,
    requirements,
    industry,
    salary,
    location,
    organizationId,
    postedBy,
    jobType,
    status = "open",
    benifits,
  } = req.body;
  if (!title || !description || !organizationId || !postedBy) {
    throw new ApiError(400, "Missing Required Fields");
  }
  const job = new Job({
    title,
    description,
    organizationId,
    jobType,
    industry,
    postedBy,
    salary,
    requirements,
    location,
    status,
    benifits,
  });
  await job.save();
  res.status(201).json(new apiResponse(201, job, "Job Created Successfully"));
});

const updateJob = asyncHandler(async (req, res) => {
  const authenticatedUser = await verifyJWT(req);
  if (!authenticatedUser) {
    throw new ApiError(401, "Unauthenticated User");
  }
  const { id } = req.params;
  const {
    title,
    description,
    status,
    salary,
    location,
    requirements,
    benifits,
  } = req.body;
  const job = await Job.findById(id);
  if (!job) {
    throw new ApiError(404, "Job Not Found");
  }
  if (title) job.title = title;
  if (salary) job.salary = salary;
  if (benifits) job.benifits = benifits;
  if (location) job.location = location;
  if (requirements) job.requirements = requirements;
  if (description) job.description = description;
  if (status) job.status = status;
  await job.save();
  res.status(200).json(new apiResponse(200, job, "Job Updated Successfully"));
});

const deleteJob = asyncHandler(async (req, res) => {
  const authenticatedUser = await verifyJWT(req);
  if (!authenticatedUser) {
    throw new ApiError(401, "Unauthenticated User");
  }
  const { id } = req.params;
  const job = await Job.findById(id);
  if (!job) {
    throw new ApiError(404, "No job found");
  }
  job.status = "closed";
  await job.save();
  res.status(200).json(new apiResponse(200, job, "Job Closed Successfully"));
});

const getJobs = asyncHandler(async (req, res) => {
  const authenticatedUser = await verifyJWT(req);
  if (!authenticatedUser) {
    throw new ApiError(401, "Unauthenticated User");
  }
  const jobs = await Job.find();
  res.status(200).json(new apiResponse(200, jobs, "All jobs retrieved successfully"));
});

const getEmployeePostedJobs = asyncHandler(async (req, res) => {
  const authenticatedUser = await verifyJWT(req);
  if (!authenticatedUser) {
    throw new ApiError(401, 'Unauthenticated User');
  }

  const employeeId = req.params.employeeId;
  const jobs = await Job.find({ postedBy: employeeId });

  res.status(200).json(jobs); 
});


export { createJob, updateJob, deleteJob, getJobs,getEmployeePostedJobs };
