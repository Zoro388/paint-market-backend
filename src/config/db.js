import dns from "dns";
import mongoose from "mongoose";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

// console.log("DNS Servers:", dns.getServers());




const connectDB = async () => {
  try {
    console.log("Trying MongoDB connection...");

    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ Mongo Error:", error);
    throw error;
  }
};

export default connectDB;