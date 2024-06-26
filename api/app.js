import express from "express";
import cors from "cors";
import mysql from "mysql";
import jwt from "jsonwebtoken";
import connection, { pool } from "./db.js";
import bcrypt from "bcrypt";
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const PORT = 5000;
connection();

const userSocketMap = {};

app.use(cors());
app.use(express.urlencoded({ extended: true })); // For URL-encoded bodies
app.use(express.json()); // For JSON bodies

app.get("/", (req, res) => res.json("hello"));

app.post("/register", async (req, res) => {
  try {
    const { username, email, password, image } = req.body;

    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(password, salt, async function (err, hash) {
        await pool.query(
          "INSERT INTO User  (username, email, password, image) VALUES (?, ?, ?, ?)",
          [username, email, hash, image]
        );

        const user = await pool.query(
          "SELECT * FROM User WHERE email= ?",
          email
        );
        console.log(user);
        const token = jwt.sign(
          { userId: user[0][0].id },
          process.env.VITE_JWT_SECRET,
          {
            expiresIn: "1h",
          }
        );

        res
          .status(201)
          .json({ message: "User registered successfully!", token });
      });
    });
  } catch (e) {
    console.error("Error during registration:", e);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await pool.query("SELECT * FROM User WHERE email = ?", [
      email,
    ]);

    if (user.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    bcrypt.compare(password, user[0][0].password, function (err, result) {
      if (!result) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = jwt.sign(
        { userId: user[0][0].id },
        process.env.VITE_JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );
      console.log(`Token from login controller: ${token}`);
      res.json({ message: "Login successful!", token });
    });
  } catch (e) {
    console.error("Error during login:", e);
    res.status(500).json({ error: "Login failed" });
  }
});

app.get('/users/:userId', async (req, res) => {
  const { userId } = req.params;
  console.log("userid: ", userId);

  try {
    const result = await pool.query("SELECT username, email, id FROM User WHERE id NOT IN (?)", [userId]);
    console.log(`Result rows: ${JSON.stringify(result[0])}`);
    res.json(result[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io with the server
const io = new Server(server);

io.on('connection', (socket) => {
  const { userId } = socket.handshake.query;

  if (!userId) {
    console.log('Connection attempt without userId');
    return;
  }

  // Add user and socket ID to the map
  userSocketMap[userId] = socket.id;
  console.log(`User ${userId} connected with socket ID ${socket.id}`);

  // Handle user disconnection
  socket.on('disconnect', () => {
    delete userSocketMap[userId];
    console.log(`User ${userId} disconnected`);
  });
});

app.post('/sendMessage', async (req, res) => {
  try {
    const { senderId, receiverId, message } = req.body;

    console.log(`Receiver Id : ${receiverId}`);

    const newMessage = await pool.query(
      "INSERT INTO Message (sender_id, receiver_id, message) VALUES (?, ?, ?)",
      [senderId, receiverId, message]
    );

    const messageId = newMessage.insertId;

    const insertedMessage = await pool.query(
      "SELECT * FROM Message WHERE id = ?",
      [messageId]
    );

    if (!insertedMessage.length) {
      return res.status(500).json({ error: "Failed to retrieve sent message" });
    }

    console.log('userSocketMap:', userSocketMap); // Log the entire userSocketMap for debugging

    const receiverSocketId = userSocketMap[receiverId];

    if (receiverSocketId) {
      console.log('Emitting receiveMessage event to the receiver', receiverId);
      io.to(receiverSocketId).emit('newMessage', insertedMessage[0]);
    } else {
      console.log('Receiver socket ID not found');
    }

    res.status(201).json(insertedMessage[0]);
  } catch (error) {
    console.error('ERROR', error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

app.get('/messages', async (req, res) => {
  try {
    const { senderId, receiverId } = req.query;

    let query = "SELECT * FROM Message WHERE ";
    const queryParams = [];

    if (senderId) {
      queryParams.push(senderId);
      query += "sender_id = ?";
    }

    if (receiverId) {
      if (senderId) {
        query += " OR ";
      }
      queryParams.push(receiverId);
      query += "receiver_id = ?";
    }

    if (!queryParams.length) {
      return res.status(400).json({ error: "Missing senderId or receiverId" });
    }

    const messages = await pool.query(query, queryParams);
    console.log(`Messages from /messages endpoint: ${messages}`);
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error', error);
    res.status(500).json({ error: "Failed to retrieve messages" });
  }
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
