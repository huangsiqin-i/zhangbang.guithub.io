const { pool } = require('../db/connection');

const getAllLinks = async (req, res) => {
  try {
    const [links] = await pool.execute('SELECT * FROM links ORDER BY created_at DESC');
    res.json(links);
  } catch (error) {
    res.status(500).json({ message: '获取链接列表失败', error: error.message });
  }
};

module.exports = { getAllLinks };
