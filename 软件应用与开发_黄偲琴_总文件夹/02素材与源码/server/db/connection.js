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
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 1000,
  acquireTimeout: 1000,
});

const mockPool = {
  query: async (sql, params) => {
    console.log(`Mock query: ${sql}`, params);
    return [[], []];
  },
  execute: async (sql, params) => {
    console.log(`Mock execute: ${sql}`, params);
    return [[], { insertId: Date.now() }];
  }
};

module.exports = mockPool;
