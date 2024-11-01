import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const studentSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

studentSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

studentSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

studentSchema.methods.generateTokens = function () {
  const accessToken = jwt.sign(
    { id: this._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.expiresIn }
  );
  const refreshToken = jwt.sign(
    { id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.expiresIn }
  );
  return { accessToken, refreshToken };
};

const Student = mongoose.model("Student", studentSchema);
export default Student;