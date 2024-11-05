import jwt from "jsonwebtoken";
import { ApiError } from "../utils/Apierror.js";
import Student from "../model/student.model.js";
import { Employee } from "../model/employee.model.js";

export const verifyJWT = async (req) => {
  const authHeader = req.header("Authorization");
  const userType = req.header("user");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "No access token provided or invalid format");
  }

  const token = authHeader.substring(7);
  if (!userType) {
    throw new ApiError(400, "User type not specified");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    let user;
    if (userType === "Student") {
      user = await Student.findById(decodedToken.id);
    } else if (userType === "Employee") {
      user = await Employee.findById(decodedToken.id);
    } else {
      throw new ApiError(400, "Invalid user type specified");
    }

    if (!user) {
      throw new ApiError(401, "Invalid access token - User not found");
    }

    return user;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new ApiError(401, "Invalid or expired token");
    }
    throw new ApiError(401, error?.message || "Authentication failed");
  }
};