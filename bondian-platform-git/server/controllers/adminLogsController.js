const { pool } = require('../db/connection');

const getAllLogs = async (req, res) => {
  try {
    const [logs] = await pool.execute('SELECT l.*, u.username FROM logs l LEFT JOIN users u ON l.user_id = u.id ORDER BY l.created_at DESC');
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: '获取日志列表失败', error: error.message });
  }
};

module.exports = { getAllLogs };
