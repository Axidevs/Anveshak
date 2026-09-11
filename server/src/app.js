const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const socketUtil = require("./utils/socket");
const authRoutes = require("./routes/authRoutes");
const firRoutes = require("./routes/firRoutes");
const caseRoutes = require("./routes/caseRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
socketUtil.init(server);

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/fir", firRoutes);
app.use("/api/case", caseRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.send("Anveshak Backend is running");
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});