const pool = require("../db/connection");

function getHealth(req, res) {
  return res.status(200).json({
    status: "ok",
    service: "bondian-web-backend",
    timestamp: new Date().toISOString()
  });
}

async function getDbHealth(req, res) {
  try {
    await pool.query("SELECT 1 AS ok");
    return res.status(200).json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      database: "disconnected",
      message: error.message
    });
  }
}

module.exports = {
  getHealth,
  getDbHealth
};
