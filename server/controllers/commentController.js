const { db } = require('../db/sqliteConnection');
const jwt = require('jsonwebtoken');

exports.getCommentsByBondian = async (req, res) => {
  try {
    const { bondianId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const comments = await new Promise((resolve) => {
      db.all('SELECT c.*, u.username, u.nickname FROM comments c LEFT JOIN users u ON c.userId = u.id WHERE c.bondianId = ? ORDER BY c.createdAt DESC LIMIT ? OFFSET ?',
        [bondianId, parseInt(limit), parseInt(offset)], (err, rows) => {
          if (err) resolve([]);
          else resolve(rows);
        });
    });
    
    res.json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createComment = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bondian_dev_secret');
    const userId = decoded.id;
    
    const { bondianId, content, parentId } = req.body;
    
    const result = await new Promise((resolve) => {
      db.run('INSERT INTO comments (bondianId, userId, content, parentId) VALUES (?, ?, ?, ?)',
        [bondianId, userId, content, parentId || 0], function(err) {
          if (err) resolve({ insertId: null });
          else resolve({ insertId: this.lastID });
        });
    });
    
    res.json({ 
      success: true, 
      message: '评论成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bondian_dev_secret');
    const userId = decoded.id;
    const userRole = decoded.role;
    const { id } = req.params;
    
    const comment = await new Promise((resolve) => {
      db.get('SELECT userId FROM comments WHERE id = ?', [id], (err, row) => {
        if (err) resolve(null);
        else resolve(row);
      });
    });
    
    if (!comment) {
      return res.status(404).json({ success: false, message: '评论不存在' });
    }
    
    if (comment.userId !== userId && userRole !== 'admin') {
      return res.status(403).json({ success: false, message: '无权限删除' });
    }
    
    await new Promise((resolve) => {
      db.run('DELETE FROM comments WHERE id = ?', [id], () => resolve());
    });
    
    res.json({ success: true, message: '评论删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllComments = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bondian_dev_secret');
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: '无权限' });
    }
    
    const comments = await new Promise((resolve) => {
      db.all('SELECT c.*, u.username, b.name as bondianName FROM comments c LEFT JOIN users u ON c.userId = u.id LEFT JOIN bondians b ON c.bondianId = b.id ORDER BY c.createdAt DESC',
        [], (err, rows) => {
          if (err) resolve([]);
          else resolve(rows);
        });
    });
    
    res.json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};