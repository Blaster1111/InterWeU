import express from "express";
import { createJob, deleteJob, getJobs, updateJob } from "../controllers/job.controllers.js";
const router = express.Router();

router.post("/create",createJob);

router.put("/create/:id",updateJob);

router.delete("/delete/:id",deleteJob);

router.get("/get",getJobs);

export default router;