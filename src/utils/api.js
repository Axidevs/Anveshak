require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Anveshak Backend is running");
});

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
