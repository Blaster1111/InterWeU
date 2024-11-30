import express from "express";
import { createJob, deleteJob, getJobs, updateJob,getEmployeePostedJobs } from "../controllers/job.controllers.js";
const router = express.Router();

router.post("/create",createJob);

router.put("/create/:id",updateJob);

router.delete("/delete/:id",deleteJob);

router.get("/get",getJobs);

router.get('/posted/:employeeId', getEmployeePostedJobs);

export default router;