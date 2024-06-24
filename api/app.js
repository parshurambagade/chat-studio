import express from "express";
import cors from "cors";
import mysql from "mysql";
import jwt from "jsonwebtoken";
import connection, { pool } from "./db.js";
import bcrypt from "bcrypt";

const app = express();
const PORT = 5000;
connection();

app.use(cors());
app.use(express.urlencoded({ extended: true })); // For URL-encoded bodies
app.use(express.json()); // For JSON bodies

app.get("/", (req, res) => res.json("hello"));

app.post("/register", async (req, res) => {
  try {
    const { username, email, password, image } = req.body;

    // Hash the password
    // const hashedPassword = await bcrypt.hash(password, 10);
    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(password, salt, async function (err, hash) {
        await pool.query(
          "INSERT INTO User  (username, email, password, image) VALUES (?, ?, ?, ?)",
          [username, email, hash, image]
        );
        
        const user = await pool.query(
          "SELECT * FROM User WHERE email= ?", email
        );
        console.log(user);
        const token = jwt.sign({ userId: user[0][0].id }, process.env.VITE_JWT_SECRET, {
          expiresIn: "1h",
        });
        //  console.log(token);

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

    // Check if user exists in database
    const user = await pool.query("SELECT * FROM User WHERE email = ?", [
      email
    ]);

    // console.log("hash password:", user[0][0].password);

    if (user.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Validate password
    bcrypt.compare(password, user[0][0].password, function (err, result) {
      if (!result) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user[0][0].id }, process.env.VITE_JWT_SECRET, {
        expiresIn: "1h",
      });

      // Send the token back to the client (mobile app)
      res.json({ message: "Login successful!", token });
    });
  } catch (e) {
    console.error("Error during login:", e);
    res.status(500).json({ error: "Login failed" });
  }
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
