const { pool } = require('../db/connection');

const getStats = async (req, res) => {
  try {
    const [bondianCount] = await pool.execute('SELECT COUNT(*) as count FROM bondians WHERE status = "approved"');
    const [userCount] = await pool.execute('SELECT COUNT(*) as count FROM users');
    const [commentCount] = await pool.execute('SELECT COUNT(*) as count FROM comments WHERE status = "approved"');
    const [favoriteCount] = await pool.execute('SELECT COUNT(*) as count FROM favorites');
    
    res.json({
      bondians: bondianCount[0].count,
      users: userCount[0].count,
      comments: commentCount[0].count,
      favorites: favoriteCount[0].count
    });
  } catch (error) {
    res.status(500).json({ message: '获取统计数据失败', error: error.message });
  }
};

module.exports = { getStats };
