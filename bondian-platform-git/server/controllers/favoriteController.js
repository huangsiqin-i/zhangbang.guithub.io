const { pool } = require('../db/connection');

const getUserFavorites = async (req, res) => {
  try {
    const [favorites] = await pool.execute(
      'SELECT f.*, b.name, b.image_url FROM favorites f LEFT JOIN bondians b ON f.bondian_id = b.id WHERE f.user_id = ? ORDER BY f.created_at DESC',
      [req.user.userId]
    );
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: '获取收藏列表失败', error: error.message });
  }
};

const addFavorite = async (req, res) => {
  try {
    const { bondian_id } = req.body;
    
    const [existing] = await pool.execute(
      'SELECT * FROM favorites WHERE user_id = ? AND bondian_id = ?',
      [req.user.userId, bondian_id]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ message: '已收藏' });
    }
    
    await pool.execute('INSERT INTO favorites (user_id, bondian_id) VALUES (?, ?)', [req.user.userId, bondian_id]);
    
    res.status(201).json({ message: '收藏成功' });
  } catch (error) {
    res.status(500).json({ message: '收藏失败', error: error.message });
  }
};

const removeFavorite = async (req, res) => {
  try {
    await pool.execute('DELETE FROM favorites WHERE user_id = ? AND bondian_id = ?', [req.user.userId, req.params.bondianId]);
    res.json({ message: '取消收藏成功' });
  } catch (error) {
    res.status(500).json({ message: '取消收藏失败', error: error.message });
  }
};

module.exports = { getUserFavorites, addFavorite, removeFavorite };
