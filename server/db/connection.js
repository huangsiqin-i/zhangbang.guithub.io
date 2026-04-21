const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config({ override: true });

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "bondian_platform",
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 5,
  queueLimit: 0,
  connectTimeout: 15000,
  charset: "utf8mb4",
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

const testConnection = async () => {
  let retries = 3;
  while (retries > 0) {
    try {
      const connection = await pool.getConnection();
      await connection.ping();
      connection.release();
      console.log("✅ Database connection established successfully");
      return true;
    } catch (error) {
      retries--;
      console.warn(`⚠️ Database connection attempt failed (${3 - retries}/3):`, error.message);
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  console.error("❌ Failed to connect to database after multiple attempts");
  return false;
};

module.exports = { pool, testConnection };