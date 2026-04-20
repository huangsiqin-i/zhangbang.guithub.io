const { pool } = require('../db/connection');

const getAllPatterns = async (req, res) => {
  try {
    const [patterns] = await pool.execute('SELECT * FROM patterns ORDER BY created_at DESC');
    res.json(patterns);
  } catch (error) {
    res.status(500).json({ message: '获取图案列表失败', error: error.message });
  }
};

const getPatternById = async (req, res) => {
  try {
    const [patterns] = await pool.execute('SELECT * FROM patterns WHERE id = ?', [req.params.id]);
    
    if (patterns.length === 0) {
      return res.status(404).json({ message: '图案不存在' });
    }
    
    res.json(patterns[0]);
  } catch (error) {
    res.status(500).json({ message: '获取图案详情失败', error: error.message });
  }
};

module.exports = { getAllPatterns, getPatternById };
