import mongoose from "mongoose";

const connectDb = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGO_DB_URI);
    console.log(
      `MONGO DB connection made. DB_HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("Error: ", error);
    throw error;
  }
};
export default connectDb;
