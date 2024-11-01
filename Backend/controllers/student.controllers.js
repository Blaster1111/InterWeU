import Student from '../model/student.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/Apierror.js';
import  {apiResponse}  from '../utils/APIresponse.js';
import { verifyJWT } from '../middleware/auth.middleware.js';


export const registerStudent = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    throw new ApiError(400, "Missing Required Fields");
  }
  const student = new Student({ username, email, password });
  await student.save();
  const { accessToken, refreshToken } = student.generateTokens();
  res.status(201).json( new apiResponse(201, { accessToken, refreshToken, student }, "Student Registered Successfully"));
});


export const loginStudent = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "Missing Required Fields");
  }
  const student = await Student.findOne({ email });
  if (!student || !(await student.matchPassword(password))) {
    throw new ApiError(401, "Invalid Credentials");
  }
  const { accessToken, refreshToken } = student.generateTokens();
  res.status(200).json(new apiResponse(200, { accessToken, refreshToken, student }, "Student Logged In Successfully"));
});


export const getStudent = asyncHandler(async (req, res) => {
  const authenticatedUser = await verifyJWT(req);
  if(!authenticatedUser){
    throw new ApiError(401,"Unauthorized Access");
  }
  const student = authe;
  if (!student) {
    throw new ApiError(404, "Student Not Found");
  }
  res.status(200).json(new apiResponse(200, { username: student.username, email: student.email }, "Student Retrieved Successfully"));
});


export const editStudent = asyncHandler(async (req, res) => {
  const authenticatedUser = await verifyJWT(req);
  if(!authenticatedUser){
    throw new ApiError(401,"Unauthorized Access");
  }
  const { username, email } = req.body;
  const student =authenticatedUser;
  if (!student) {
    throw new ApiError(404, "Student Not Found");
  }
  if (username) student.username = username;
  if (email) student.email = email;
  await student.save();
  res.status(200).json(new apiResponse(200, { username: student.username, email: student.email }, "Student Updated Successfully"));
});