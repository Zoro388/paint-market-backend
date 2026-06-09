import dotenv from "dotenv";

dotenv.config();

console.log("STEP 1 - dotenv loaded");
console.log("RESEND_API_KEY =", process.env.RESEND_API_KEY);

import app from "./app.js";
import connectDB from "./config/db.js";

console.log("STEP 2 - imports loaded");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log("STEP 3 - starting DB connection");

    await connectDB();

    console.log("STEP 4 - DB connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("SERVER ERROR:", error);
  }
};

startServer();