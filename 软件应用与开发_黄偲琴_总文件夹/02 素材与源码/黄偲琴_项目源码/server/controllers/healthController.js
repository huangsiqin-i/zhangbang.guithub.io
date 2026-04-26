const { db } = require("../db/sqliteConnection");

function getHealth(req, res) {
  return res.status(200).json({
    status: "ok",
    service: "bondian-web-backend",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
}

async function getDbHealth(req, res) {
  try {
    await new Promise((resolve, reject) => {
      db.get('SELECT 1', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    return res.status(200).json({
      status: "ok",
      database: "connected",
      message: "Database connection is healthy",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(503).json({
      status: "error",
      database: "disconnected",
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = {
  getHealth,
  getDbHealth
};