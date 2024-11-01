import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    resume: {
      type: String,
    },
    coverLetter: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Applied", "Under Review", "Interview Scheduled", "Rejected", "Accepted", "Revoked"],
      default: "Applied",
    },
    dateApplied: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const JobApplication = mongoose.model("JobApplication", jobApplicationSchema);
export default JobApplication;
