require("dotenv").config();
const jwt = require("jsonwebtoken");
const { pool } = require("../db.js");
const bcrypt = require("bcrypt");

async function isEmailRegistered(email) {
  const query = "SELECT COUNT(*) AS count FROM User WHERE email = ?";
  const [rows] = await pool.query(query, [email]);
  return rows[0].count > 0;
}

module.exports.register = async (req, res) => {
  try {
    const { username, email, password, image } = req.body;

    if (!username || !email || !password || !image) {
      return res.status(400).json({ message: "All fields are required" });
    }

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

    const [user] = await pool.query("SELECT * FROM User WHERE email = ?", [
      email,
    ]);

    const token = jwt.sign(
      { userId: user[0].id },
      process.env.VITE_JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.status(201).json({ message: "User registered successfully!", token });
  } catch (e) {
    console.error("Error during registration:", e);
    res.status(500).json({ error: "Registration failed" });
  }
};

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const [user] = await pool.query("SELECT * FROM User WHERE email = ?", [
      email,
    ]);

    if (user.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const result = await bcrypt.compare(password, user[0].password);
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

    console.log(`Login successful, Token: ${token}`);

    res.json({ message: "Login successful!", token });
  } catch (e) {
    console.error("Error during login:", e);
    res.status(500).json({ error: "Login failed" });
  }
};
