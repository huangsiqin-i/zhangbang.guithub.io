const connection = require('../db/connection');
const jwt = require('jsonwebtoken');

exports.addFavorite = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bondian_dev_secret');
    const userId = decoded.id || decoded.userId;
    const { bondianId } = req.body;
    
    await connection.execute(
      'INSERT INTO favorites (user_id, bondian_id) VALUES (?, ?)',
      [userId, bondianId]
    );
    
    res.json({ success: true, message: '收藏成功' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: '已收藏' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bondian_dev_secret');
    const userId = decoded.id || decoded.userId;
    const { bondianId } = req.params;
    
    await connection.execute(
      'DELETE FROM favorites WHERE user_id = ? AND bondian_id = ?',
      [userId, bondianId]
    );
    
    res.json({ success: true, message: '取消收藏成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserFavorites = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bondian_dev_secret');
    const userId = decoded.id || decoded.userId;
    
    const [favorites] = await connection.execute(
      `SELECT f.*, b.name, b.image_url, bt.name as type_name 
       FROM favorites f 
       LEFT JOIN bondians b ON f.bondian_id = b.id 
       LEFT JOIN bondian_types bt ON b.type_id = bt.id 
       WHERE f.user_id = ? ORDER BY f.created_at DESC`,
      [userId]
    );
    
    res.json({ success: true, data: favorites });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.checkFavorite = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.json({ success: true, data: { isFavorite: false } });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bondian_dev_secret');
    const userId = decoded.id || decoded.userId;
    const { bondianId } = req.params;
    
    const [favorites] = await connection.execute(
      'SELECT id FROM favorites WHERE user_id = ? AND bondian_id = ?',
      [userId, bondianId]
    );
    
    res.json({ success: true, data: { isFavorite: favorites.length > 0 } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
