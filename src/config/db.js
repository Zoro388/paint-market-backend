import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("Trying MongoDB connection...");

    const conn = await mongoose.connect(
      process.env.MONGODB_URI
    );

    console.log(
      `✅ MongoDB Connected: ${conn.connection.host}`
    );
  } catch (error) {
    console.error("❌ Mongo Error:", error);
    throw error;
  }
};

export default connectDB;