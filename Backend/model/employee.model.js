import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required:true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required:true,
    },
    email: {
      type: String,
      required:true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        required:true,
    }
  },
  { timestamps: true }
);

export const Employee = mongoose.model("Employee", employeeSchema);
