import express from "express";
import { createJobApplication, updateJobApplicationStatus } from "../controllers/jobApplication.controllers.js";

const router = express.Router();

router.post('/apply',createJobApplication);

router.put('/apply/:id',updateJobApplicationStatus);

export default router;