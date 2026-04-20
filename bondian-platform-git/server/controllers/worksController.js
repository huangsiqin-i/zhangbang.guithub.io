const { pool } = require('../db/connection');

const getAllWorks = async (req, res) => {
  try {
    const [works] = await pool.execute('SELECT * FROM works ORDER BY created_at DESC');
    res.json(works);
  } catch (error) {
    res.status(500).json({ message: '获取作品列表失败', error: error.message });
  }
};

const getWorkById = async (req, res) => {
  try {
    const [works] = await pool.execute('SELECT * FROM works WHERE id = ?', [req.params.id]);
    
    if (works.length === 0) {
      return res.status(404).json({ message: '作品不存在' });
    }
    
    res.json(works[0]);
  } catch (error) {
    res.status(500).json({ message: '获取作品详情失败', error: error.message });
  }
};

module.exports = { getAllWorks, getWorkById };
