  const express = require("express");
  const cors = require("cors");
  const mysql = require("mysql");
  const jwt = require("jsonwebtoken");
  const { pool, connectToDatabase } = require("./db.js");
  const bcrypt = require("bcrypt");
  const http = require("http");
  const socketIo = require("socket.io");
  require('dotenv').config();

  const app = express();
  const PORT = process.env.PORT || 5000;

  connectToDatabase();

  app.use(cors());
  app.use(express.urlencoded({ extended: true })); // For URL-encoded bodies
  app.use(express.json()); // For JSON bodies

  async function isEmailRegistered(email) {
    const query = "SELECT COUNT(*) AS count FROM User WHERE email = ?";
    const [rows] = await pool.query(query, [email]);
    return rows[0].count > 0;
  }

  app.get("/", (req, res) => res.json("hello"));

  app.post("/register", async (req, res) => {
    try {
      const { username, email, password, image } = req.body;
      const emailExists = await isEmailRegistered(email);

      if (emailExists) {
        return res.status(400).json({ message: "Email is already registered" });
      }

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      await pool.query(
        "INSERT INTO User (username, email, password, image) VALUES (?, ?, ?, ?)",
        [username, email, hash, image]
      );

      const [user] = await pool.query("SELECT * FROM User WHERE email = ?", [email]);
      const token = jwt.sign({ userId: user[0].id }, process.env.VITE_JWT_SECRET, {
        expiresIn: "1h",
      });

      res.status(201).json({ message: "User registered successfully!", token });
    } catch (e) {
      console.error("Error during registration:", e);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const [user] = await pool.query("SELECT * FROM User WHERE email = ?", [email]);

      if (user.length === 0) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const result = await bcrypt.compare(password, user[0].password);
      if (!result) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = jwt.sign({ userId: user[0].id }, process.env.VITE_JWT_SECRET, {
        expiresIn: "1h",
      });

      res.json({ message: "Login successful!", token });
    } catch (e) {
      console.error("Error during login:", e);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.get("/users/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const [result] = await pool.query(
        "SELECT username, email, id FROM User WHERE id NOT IN (?)",
        [userId]
      );
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).send(err.message);
    }
  });

  app.get("/userInfo/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      if (!userId.length) {
        return res.status(400).json({ error: "Missing userId" });
      }

      const query = "SELECT id, username, email, image FROM User WHERE id = ?";
      const [response] = await pool.query(query, [userId]);

      res.status(200).json(response);
    } catch (error) {
      console.error("Error", error);
      res.status(500).json({ error: "Failed to retrieve user" });
    }
  });

  app.get("/userMessages/:userId", async (req, res) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ error: "Missing userId" });
      }

      const query = `
        SELECT * FROM Message
        WHERE (sender_id = ? OR receiver_id = ?)
      `;
      const queryParams = [userId, userId];

      const [messages] = await pool.query(query, queryParams);

      res.status(200).json(messages);
    } catch (error) {
      console.error("Error", error);
      res.status(500).json({ error: "Failed to retrieve messages" });
    }
  });

  app.get("/messages", async (req, res) => {
    try {
      const { senderId, receiverId } = req.query;

      if (!senderId || !receiverId) {
        return res.status(400).json({ error: "Missing senderId or receiverId" });
      }

      const query = `
        SELECT * FROM Message
        WHERE (sender_id = ? AND receiver_id = ?)
        OR (sender_id = ? AND receiver_id = ?)
      `;
      const queryParams = [senderId, receiverId, receiverId, senderId];

      const [messages] = await pool.query(query, queryParams);
      res.status(200).json(messages);
    } catch (error) {
      console.error("Error", error);
      res.status(500).json({ error: "Failed to retrieve messages" });
    }
  });

  const server = http.createServer(app);
  const io = socketIo(server);
  const userSocketMap = {};

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId !== "undefined") userSocketMap[userId] = socket.id;

    socket.on("disconnect", () => {
      delete userSocketMap[userId];
    });

    socket.on("sendMessage", async ({ senderId, receiverId, message }) => {
      try {
        // Insert the new message directly into the database
        const [newMessage] = await pool.query(
          "INSERT INTO Message (sender_id, receiver_id, message) VALUES (?, ?, ?)",
          [senderId, receiverId, message]
        );

        const messageId = newMessage.insertId;

        const [insertedMessage] = await pool.query(
          "SELECT * FROM Message WHERE id = ?",
          [messageId]
        );

        if (!insertedMessage.length) {
          console.error("Failed to retrieve sent message");
          return;
        }

        const receiverSocketId = userSocketMap[receiverId];

        if (receiverSocketId) {
          io.to(receiverSocketId).emit("newMessage", insertedMessage[0]);
        }

        // Also emit the new message back to the sender to update their state
        const senderSocketId = userSocketMap[senderId];
        if (senderSocketId) {
          io.to(senderSocketId).emit("newMessage", insertedMessage[0]);
        }

      } catch (error) {
        console.error("ERROR", error);
      }
    });

    socket.on("messages-received", async ({ data }) => {
      console.log(`Messages received: ${JSON.stringify(data)}`);
      const sentMessages = data.filter((message) => message.status == "sent").map((message) => message.id);
    
      if (sentMessages.length === 0) return;
    
      const query = "UPDATE Message SET status = 'delivered' WHERE id IN (?)";
    
      try {
        
        await pool.query(query, [sentMessages]);
        
      } catch (error) {
        console.error(`Error updating message status: ${error.message}`);
      }
    });
    

    socket.on("messages-seen", async ({ data }) => {
      console.log(`Messages seen: ${JSON.stringify(data)}`);
      const seenMessages = data.filter((message) => message.status == "delivered").map((message) => message.id);
      
      if (seenMessages.length == 0) {
        console.log("seenMessages have no elements");
        return;
      };
    
      const query = "UPDATE Message SET status = 'seen' WHERE id IN (?)";
    
      try {
        await pool.query(query, [seenMessages]);
        console.log(`Updated ${seenMessages.length} messages to 'seen' status`);
    
        // Emit the update back to the sender
        io.to(userSocketMap[data[0].sender_id]).emit('messages-seen', seenMessages);
      } catch (error) {
        console.error(`Error updating message status: ${error.message}`);
      }
    });
    
    // REACT-NATIVE-WEBRTC

    socket.on('offer', (data) => {
      socket.broadcast.emit('offer', data);
    });
  
    socket.on('answer', (data) => {
      socket.broadcast.emit('answer', data);
    });
  
    socket.on('candidate', (data) => {
      socket.broadcast.emit('candidate', data);
    });
  
    
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  const SOCKET_PORT = process.env.SOCKET_PORT || 3000;
  server.listen(SOCKET_PORT, () => console.log(`Socket is connected to port: ${SOCKET_PORT}`));