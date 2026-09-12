const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");

let io;

module.exports = {
  init: (server) => {
    io = socketIo(server, {
      cors: { origin: "*" },
    });

    io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error: Token missing"));
      }
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded; // { id, role }
        next();
      } catch (err) {
        next(new Error("Authentication error: Invalid token"));
      }
    });

    io.on("connection", (socket) => {
      console.log(`Socket connected: ${socket.id} (User: ${socket.user.userId})`);
      
      socket.join(socket.user.userId.toString());

      socket.on("joinCase", (caseId) => {
        socket.join(`case_${caseId}`);
        console.log(`User ${socket.user.userId} joined room case_${caseId}`);
      });

      socket.on("leaveCase", (caseId) => {
        socket.leave(`case_${caseId}`);
      });

      socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.id}`);
      });
    });

    return io;
  },
  
  getIo: () => {
    if (!io) throw new Error("Socket.io not initialized");
    return io;
  },
};
