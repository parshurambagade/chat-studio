const mysql = require('mysql2/promise'); 
const dotenv = require('dotenv').config(); 

const pool =  mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function connectToDatabase() {

    try {
      
      // console.log("host:", process.env.VITE_DB_HOST);
      const connection = await pool.getConnection();
      
      console.log('Connected to the MySQL database.');
    
      connection.release(); // Release the connection back to the pool
    } catch (err) {
      console.error('Error connecting to MySQL database:', err.message);
    }
  }

module.exports = { pool, connectToDatabase};