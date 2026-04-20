const { pool } = require('../db/connection');

const getAllMasters = async (req, res) => {
  try {
    const [masters] = await pool.execute('SELECT * FROM masters ORDER BY created_at DESC');
    res.json(masters);
  } catch (error) {
    res.status(500).json({ message: '获取传承人列表失败', error: error.message });
  }
};

const getMasterById = async (req, res) => {
  try {
    const [masters] = await pool.execute('SELECT * FROM masters WHERE id = ?', [req.params.id]);
    
    if (masters.length === 0) {
      return res.status(404).json({ message: '传承人不存在' });
    }
    
    res.json(masters[0]);
  } catch (error) {
    res.status(500).json({ message: '获取传承人详情失败', error: error.message });
  }
};

module.exports = { getAllMasters, getMasterById };
