import express from "express";
import { createJob, deleteJob, updateJob } from "../controllers/job.controllers.js";
const router = express.Router();

router.post("/create",createJob);

router.put("/create/:id",updateJob);

router.delete("/delete/:id",deleteJob);

export default router;