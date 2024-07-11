const express = require("express");
const { sendMessage, messagesReceived, messagesSeen } = require("./controllers/userControllers");
const { login, register } = require("./controllers/authControllers");
const { getUserInfo, getUsers, getUsersMessages } = require("./controllers/userControllers");
const { connectToDatabase } = require("./db");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

connectToDatabase();

app.use(cors());
app.use(express.urlencoded({ extended: true })); // For URL-encoded bodies
app.use(express.json()); // For JSON bodies

// Routes
app.get('/', (req, res) => res.json("hello"));
app.post('/register', register);
app.post('/login', login);
app.get("/users/:userId", getUsers);
app.get('/userInfo/:userId', getUserInfo);
app.get("/userMessages/:userId", getUsersMessages);

const server = http.createServer(app);
const io = socketIO(server);

const userSocketMap = {}; // Move userSocketMap inside index.js

io.on("connection", (socket) => {
  console.log("New client connected");
  const userId = socket.handshake.query.userId;

  if (userId !== "undefined") userSocketMap[userId] = socket.id;

  socket.on("sendMessage", async (data) => {
    await sendMessage(io, userSocketMap, data);
  });

  socket.on("messages-received", async (data) => {
    await messagesReceived(io, userSocketMap, data);
  });

  socket.on("messages-seen", async (data) => {
    await messagesSeen(io, userSocketMap, data);
  });

  // Handle offer, answer, and ICE candidate events for video call and audio call
  socket.on("offer", (payload) => {
    console.log("New offer received", payload.sdp);
    socket.broadcast.emit("offer", payload); // Broadcast to all clients except sender
  });

  socket.on("answer", (payload) => {
    console.log("New answer received", payload.sdp);
    socket.broadcast.emit("answer", payload);
  });

  socket.on("ice-candidate", (payload) => {
    console.log("New ICE candidate received", payload.candidate);
    socket.broadcast.emit("ice-candidate", payload);
  });

  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    console.log("Client disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

module.exports = { io, userSocketMap };
