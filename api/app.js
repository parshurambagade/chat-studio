const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const { pool, connectToDatabase } = require("./db.js");
const bcrypt = require("bcrypt");


const app = express();
const PORT = 5000;

connectToDatabase();

app.use(cors());
app.use(express.urlencoded({ extended: true })); // For URL-encoded bodies
app.use(express.json()); // For JSON bodies

async function isEmailRegistered(email) {
  const query = 'SELECT COUNT(*) AS count FROM User WHERE email = ?';
  const [rows] = await pool.query(query, [email]);
  return rows[0].count > 0;
} 

app.get("/", (req, res) => res.json("hello"));

app.post("/register", async (req, res) => {
  try {
    const { username, email, password, image } = req.body;

    const emailExists = await isEmailRegistered(email);

    if (emailExists) {
      // console.error("Email already exists!");
      return res.status(400).json({ message: "Email is already registered" });
    }

   
    
    // console.log(`Registered Emails: ${JSON.stringify(registerdEmails[0])}`);

    bcrypt.genSalt(10, function (err, salt) {
      if (err) {
        console.error("Error generating salt:", err);
        return res.status(500).json({ error: "Registration failed" });
      }

      bcrypt.hash(password, salt, async function (err, hash) {
        if (err) {
          console.error("Error hashing password:", err);
          return res.status(500).json({ error: "Registration failed" });
        }

        await pool.query(
          "INSERT INTO User (username, email, password, image) VALUES (?, ?, ?, ?)",
          [username, email, hash, image]
        );

        const [user] = await pool.query(
          "SELECT * FROM User WHERE email= ?",
          [email]
        );
        console.log(user);
        const token = jwt.sign(
          { userId: user[0].id },
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

    const [user] = await pool.query("SELECT * FROM User WHERE email = ?", [
      email,
    ]);

    if (user.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    bcrypt.compare(password, user[0].password, function (err, result) {
      if (err) {
        console.error("Error comparing passwords:", err);
        return res.status(500).json({ error: "Login failed" });
      }

      if (!result) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = jwt.sign(
        { userId: user[0].id },
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

app.get("/users/:userId", async (req, res) => {
  const { userId } = req.params;
  // console.log("userid: ", userId);

  try {
    const [result] = await pool.query(
      "SELECT username, email, id FROM User WHERE id NOT IN (?)",
      [userId]
    );
    // console.log(`Result rows: ${JSON.stringify(result)}`);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

app.post("/sendMessage", async (req, res) => {
  try {
    const { senderId, receiverId, message } = req.body;

    // console.log(`Sender Id : ${senderId}`);
    // console.log(`Receiver Id : ${receiverId}`);
    // console.log(`Message : ${message}`);


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
      return res.status(500).json({ error: "Failed to retrieve sent message" });
    }

    console.log("userSocketMap:", userSocketMap); // Log the entire userSocketMap for debugging
    console.log("Receiver Id:", receiverId); // Log the entire userSocketMap for debugging

    const receiverSocketId = userSocketMap[receiverId];
    console.log("ReceiverSocketId:", receiverSocketId); // Log the entire userSocketMap for debugging

    if (receiverSocketId) {
      console.log("Emitting receiveMessage event to the receiver", receiverId);
      io.to(receiverSocketId).emit("newMessage", insertedMessage[0]);
    } else {
      console.log("Receiver socket ID not found");
    }

    res.status(201).json(insertedMessage[0]);
  } catch (error) {
    console.error("ERROR", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

app.get("/messages", async (req, res) => {
  try {
    const { senderId, receiverId } = req.query;

    if (!senderId || !receiverId) {
      return res.status(400).json({ error: "Missing senderId or receiverId" });
    }

    // Modify query to ensure both sender_id and receiver_id match
    const query = `
      SELECT * FROM Message
      WHERE (sender_id = ? AND receiver_id = ?)
      OR (sender_id = ? AND receiver_id = ?)
    `;
    const queryParams = [senderId, receiverId, receiverId, senderId];

    const [messages] = await pool.query(query, queryParams);
    console.log(`Messages from /messages endpoint: ${messages}`);
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error", error);
    res.status(500).json({ error: "Failed to retrieve messages" });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const http = require('http').createServer(app);
const io =  require('socket.io')(http);
const userSocketMap = {};

io.on('connection', socket => {
  console.log(`User is connected to the socket: ${socket.id}`);

  const userId = socket.handshake.query.userId;

  console.log(`UserId in the socket: ${userId}`);

  if(userId !== 'undefined') userSocketMap[userId] = socket.id;

  console.log(`Socket data: ${JSON.stringify(userSocketMap)}`);

  socket.on('disconnect', () => {
    console.log(`User disconnected from the socket: ${userId}`);
    delete userSocketMap[userId];
  });

  socket.on('sendMessage', ({senderId, receiverId, message}) => {
    const receiverSocketId = userSocketMap[receiverId];
    console.log(`Receiver Id from the socket: ${receiverId}`)
    if(receiverSocketId){
      io.to(receiverSocketId).emit('receiveMessage', {
        senderId,
        message
      });
    };

  })
})

http.listen(3000, () => console.log(`Socket is connected to the port: 3000`));