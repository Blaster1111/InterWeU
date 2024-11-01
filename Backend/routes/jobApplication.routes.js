import express from "express";
import { createJobApplicaiton, updateJobApplicationStatus } from "../controllers/jobApplication.controllers.js";

const router = express.Router();

router.post('/apply',createJobApplicaiton);

router.put('/apply/:id',updateJobApplicationStatus);

export default router;