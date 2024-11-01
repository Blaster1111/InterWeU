import { Organization } from '../model/organization.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/Apierror.js';
import { apiResponse } from '../utils/APIresponse.js';


export const createOrganization = asyncHandler(async (req, res) => {
  const { name, organizationType, email, phoneNo } = req.body;
  if (!name || !organizationType || !email || !phoneNo) {
    throw new ApiError(400, "Missing Required Fields");
  }
  const organization = new Organization({ name, organizationType, email, phoneNo });
  await organization.save();
  res.status(201).json(new apiResponse(201, organization, "Organization Created Successfully"));
});


export const getOrganizations = asyncHandler(async (req, res) => {
  const organizations = await Organization.find({});
  res.status(200).json(new apiResponse(200, organizations, "Organizations Retrieved Successfully"));
});


export const getOrganization = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const organization = await Organization.findById(id);
  if (!organization) {
    throw new ApiError(404, "Organization Not Found");
  }
  res.status(200).json(new apiResponse(200, organization, "Organization Retrieved Successfully"));
});


export const editOrganization = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, organizationType, email, phoneNo } = req.body;
  const organization = await Organization.findById(id);
  if (!organization) {
    throw new ApiError(404, "Organization Not Found");
  }
  if (name) organization.name = name;
  if (organizationType) organization.organizationType = organizationType;
  if (email) organization.email = email;
  if (phoneNo) organization.phoneNo = phoneNo;
  await organization.save();
  res.status(200).json(new apiResponse(200, organization, "Organization Updated Successfully"));
});


export const deleteOrganization = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const organization = await Organization.findByIdAndDelete(id);
  if (!organization) {
    throw new ApiError(404, "Organization Not Found");
  }
  res.status(200).json(new apiResponse(200, null, "Organization Deleted Successfully"));
});