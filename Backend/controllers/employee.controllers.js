import { Employee } from "../model/employee.model.js";
import { Organization } from "../model/organization.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/Apierror.js";
import { apiResponse } from "../utils/APIresponse.js";
import bcrypt from "bcrypt";
import { verifyJWT } from "../middleware/auth.middleware.js";

export const registerEmployee = asyncHandler(async (req, res) => {
  const { name, organizationId, email, username, password, role } = req.body;
  if (!name || !organizationId || !email || !username || !password || !role) {
    throw new ApiError(400, "Missing Required Fields");
  }
  const organization = await Organization.findById(organizationId);
  if (!organization) {
    throw new ApiError(404, "Organization Not Found");
  }
  const employee = new Employee({
    name,
    organizationId,
    email,
    username,
    password,
    role,
  });
  await employee.save();
  const token = await employee.generateToken();
  res
    .status(201)
    .json(
      new apiResponse(201, { employee, token }, "Employee Registered Successfully")
    );
});

export const loginEmployee = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    throw new ApiError(400, "Missing Required Fields");
  }
  const employee = await Employee.findOne({ username });
  if (!employee || !(await bcrypt.compare(password, employee.password))) {
    throw new ApiError(401, "Invalid Credentials");
  }
  const token = await employee.generateToken();
  res
    .status(200)
    .json(new 
      apiResponse(200, { employee, token }, "Employee Logged In Successfully")
    );
});

export const editEmployee = asyncHandler(async (req, res) => {
  const authenticatedUser = await verifyJWT(req);
  if (authenticatedUser) {
    throw new ApiError(401, "Unauthorized Access");
  }
  const { name, email, password, role } = req.body;
  const employee = await Employee.findById(authenticatedUser._id);
  if (!employee) {
    throw new ApiError(404, "Employee Not Found");
  }
  if (name) employee.name = name;
  if (email) employee.email = email;
  if (role) employee.role = role;
  await employee.save();
  res
    .status(200)
    .json(new apiResponse(200, employee, "Employee Updated Successfully"));
});

export const deleteEmployee = asyncHandler(async (req, res) => {
  const authenticatedUser = verifyJWT(req);
  if(!authenticatedUser){
    throw new ApiError(401,"Unauthenticated User");
  }
  const employee = await Employee.findByIdAndDelete(authenticatedUser._id);
  if (!employee) {
    throw new ApiError(404, "Employee Not Found");
  }
  res.status(200).json(new apiResponse(200, null, "Employee Deleted Successfully"));
});
