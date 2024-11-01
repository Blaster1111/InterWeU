import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/Apierror.js";
import Student from "../model/student.model.js";
import { Employee } from "../model/employee.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    const user = req.header("user");
    if (user === "Student") {
      const token =
        authHeader && authHeader.startsWith("Bearer ")
          ? authHeader.substring(7)
          : null;
      if (!token) {
        throw new ApiError(401, "No access token provided in headers");
      }
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const student = await Student.findById(decodedToken?._id).select(
        "-password -refreshToken"
      );
      if (!student) {
        throw new ApiError(401, "Invalid Access Token");
      }
      return student;
    } else if (user === "Employee") {
      const token =
        authHeader && authHeader.startsWith("Bearer ")
          ? authHeader.substring(7)
          : null;
      if (!token) {
        throw new ApiError(401, "No access token provided in headers");
      }
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const employee = await Employee.findById(decodedToken?._id).select(
        "-password -refreshToken"
      );
      if (!employee) {
        throw new ApiError(401, "Invalid Access Token");
      }
      return employee;
    } else {
      throw new ApiError(400, "Missing Required Fields");
    }
  } catch (error) {
    next(new ApiError(401, error?.message || "Invalid access token"));
  }
});
