import mysql from 'mysql2/promise'; 
import dotenv from 'dotenv';
dotenv.config();



async function connectToDatabase() {

    try {

      const pool =  mysql.createPool({
        host: process.env.VITE_DB_HOST,
        port: process.env.VITE_DB_PORT,
        user: process.env.VITE_DB_USER,
        password: process.env.VITE_DB_PASSWORD,
        database: process.env.VITE_DB_NAME,
      });
      // console.log("host:", process.env.VITE_DB_HOST);
      const connection = await pool.getConnection();
      
      console.log('Connected to the MySQL database.');
    
      connection.release(); // Release the connection back to the pool
    } catch (err) {
      console.error('Error connecting to MySQL database:', err.message);
    }
  }
  
export default connectToDatabase;