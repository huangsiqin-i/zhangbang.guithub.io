function getHealth(req, res) {
  return res.status(200).json({
    status: "ok",
    service: "bondian-web-backend",
    timestamp: new Date().toISOString()
  });
}

async function getDbHealth(req, res) {
  return res.status(503).json({
    status: "warning",
    database: "not configured",
    message: "Using in-memory storage for development",
    timestamp: new Date().toISOString()
  });
}

module.exports = {
  getHealth,
  getDbHealth
};
