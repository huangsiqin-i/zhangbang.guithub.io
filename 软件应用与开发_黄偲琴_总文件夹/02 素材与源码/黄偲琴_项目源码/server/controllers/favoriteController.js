const { db } = require('../db/sqliteConnection');
const jwt = require('jsonwebtoken');

exports.addFavorite = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bondian_dev_secret');
    const userId = decoded.id;
    const { bondianId } = req.body;
    
    const existing = await new Promise((resolve) => {
      db.get('SELECT id FROM favorites WHERE userId = ? AND bondianId = ?', [userId, bondianId], (err, row) => {
        if (err) resolve(null);
        else resolve(row);
      });
    });
    
    if (existing) {
      return res.status(400).json({ success: false, message: '已收藏' });
    }
    
    await new Promise((resolve) => {
      db.run('INSERT INTO favorites (userId, bondianId) VALUES (?, ?)', [userId, bondianId], () => resolve());
    });
    
    res.json({ success: true, message: '收藏成功' });
  } catch (error) {
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
    const userId = decoded.id;
    const { bondianId } = req.params;
    
    await new Promise((resolve) => {
      db.run('DELETE FROM favorites WHERE userId = ? AND bondianId = ?', [userId, bondianId], () => resolve());
    });
    
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
    const userId = decoded.id;
    
    const favorites = await new Promise((resolve) => {
      db.all('SELECT f.*, b.name, b.imageUrl, b.type FROM favorites f LEFT JOIN bondians b ON f.bondianId = b.id WHERE f.userId = ? ORDER BY f.createdAt DESC',
        [userId], (err, rows) => {
          if (err) resolve([]);
          else resolve(rows);
        });
    });
    
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
    const userId = decoded.id;
    const { bondianId } = req.params;
    
    const favorite = await new Promise((resolve) => {
      db.get('SELECT id FROM favorites WHERE userId = ? AND bondianId = ?', [userId, bondianId], (err, row) => {
        if (err) resolve(null);
        else resolve(row);
      });
    });
    
    res.json({ success: true, data: { isFavorite: !!favorite } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};