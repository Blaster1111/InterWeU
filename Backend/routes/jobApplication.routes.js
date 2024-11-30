    import express from "express";
    import multer from "multer";
    import { createJobApplication, updateJobApplicationStatus,getCandidateApplications,getJobApplicationsEmployee } from "../controllers/jobApplication.controllers.js";

    const upload = multer({ dest: 'uploads/' });

    const router = express.Router();

    router.post('/apply', upload.single('Resume'), createJobApplication);

    router.put('/apply/:id', updateJobApplicationStatus);

    router.get('/apply',getCandidateApplications);

    router.get("/:jobId/applications", getJobApplicationsEmployee);

    export default router;
