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
const courtRoutes = require("./routes/courtRoutes");
const path = require("path");

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
socketUtil.init(server);

const helmet = require("helmet");

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:3000"], credentials: true }));
app.use(express.json({ limit: '1mb' }));

// Serve uploads folder statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/fir", firRoutes);
app.use("/api/case", caseRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/court", courtRoutes);
app.use("/api/chat", require("./routes/chatRoutes"));

app.get("/", (req, res) => {
  res.send("Anveshak Backend is running");
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});