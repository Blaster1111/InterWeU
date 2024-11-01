import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    organizationType: {
      type: String,
    },
    email:{
        type:String,
    },
    phoneNo:{
        type:String,
    }
  },
  { timestamps: true }
);

export const Organization = mongoose.model("Organization",organizationSchema);