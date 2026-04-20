const connection = require('../db/connection');
const jwt = require('jsonwebtoken');

exports.getCommentsByBondian = async (req, res) => {
  try {
    const { bondianId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const [comments] = await connection.execute(
      `SELECT c.*, u.username, u.nickname, u.avatar_url 
       FROM comments c 
       LEFT JOIN users u ON c.user_id = u.id 
       WHERE c.bondian_id = ? AND c.status = 'approved' 
       ORDER BY c.created_at DESC LIMIT ? OFFSET ?`,
      [bondianId, parseInt(limit), parseInt(offset)]
    );
    
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
    const userId = decoded.id || decoded.userId;
    
    const { bondianId, content, parentId } = req.body;
    
    const [result] = await connection.execute(
      'INSERT INTO comments (bondian_id, user_id, content, parent_id) VALUES (?, ?, ?, ?)',
      [bondianId, userId, content, parentId || null]
    );
    
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
    const userId = decoded.id || decoded.userId;
    const userRole = decoded.role;
    const { id } = req.params;
    
    const [comments] = await connection.execute('SELECT user_id FROM comments WHERE id = ?', [id]);
    if (comments.length === 0) {
      return res.status(404).json({ success: false, message: '评论不存在' });
    }
    
    if (comments[0].user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ success: false, message: '无权限删除' });
    }
    
    await connection.execute('DELETE FROM comments WHERE id = ?', [id]);
    
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
    
    const [comments] = await connection.execute(
      `SELECT c.*, u.username, b.name as bondian_name 
       FROM comments c 
       LEFT JOIN users u ON c.user_id = u.id 
       LEFT JOIN bondians b ON c.bondian_id = b.id 
       ORDER BY c.created_at DESC`
    );
    
    res.json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};