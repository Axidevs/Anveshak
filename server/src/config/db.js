// 

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB Atlas...");
    console.log("MONGO_URI loaded:", !!process.env.MONGO_URI);
    console.log("MONGO_URI prefix:", process.env.MONGO_URI?.slice(0, 20));

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      tls: true,
    });

    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
};

module.exports = connectDB;