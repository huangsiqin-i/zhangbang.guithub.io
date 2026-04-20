const connection = require('../db/connection');
const jwt = require('jsonwebtoken');

function verifyAdmin(req) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return { valid: false, message: '未登录' };
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bondian_dev_secret');
    if (decoded.role !== 'admin') {
      return { valid: false, message: '无权限' };
    }
    return { valid: true, decoded };
  } catch (error) {
    return { valid: false, message: 'token无效' };
  }
}

exports.getAnnouncements = async (req, res) => {
  const auth = verifyAdmin(req);
  if (!auth.valid) {
    return res.status(403).json({ success: false, message: auth.message });
  }
  
  try {
    const [rows] = await connection.execute(
      'SELECT * FROM announcements ORDER BY created_at DESC'
    );
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getActiveAnnouncement = async (req, res) => {
  try {
    const [rows] = await connection.execute(
      'SELECT * FROM announcements WHERE status = "active" AND start_time <= NOW() AND (end_time >= NOW() OR end_time IS NULL) ORDER BY sort_order ASC LIMIT 1'
    );
    
    if (rows.length === 0) {
      return res.json({ success: true, data: null });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createAnnouncement = async (req, res) => {
  const auth = verifyAdmin(req);
  if (!auth.valid) {
    return res.status(403).json({ success: false, message: auth.message });
  }
  
  const { title, content, start_time, end_time, sort_order } = req.body;
  
  try {
    const [result] = await connection.execute(
      'INSERT INTO announcements (title, content, status, start_time, end_time, sort_order) VALUES (?, ?, "inactive", ?, ?, ?)',
      [title, content, start_time || null, end_time || null, sort_order || 0]
    );
    
    res.json({
      success: true,
      message: '公告创建成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAnnouncement = async (req, res) => {
  const auth = verifyAdmin(req);
  if (!auth.valid) {
    return res.status(403).json({ success: false, message: auth.message });
  }
  
  const id = req.params.id;
  const { title, content, status, start_time, end_time, sort_order } = req.body;
  
  try {
    await connection.execute(
      'UPDATE announcements SET title = ?, content = ?, status = ?, start_time = ?, end_time = ?, sort_order = ? WHERE id = ?',
      [title, content, status, start_time || null, end_time || null, sort_order || 0, id]
    );
    
    res.json({
      success: true,
      message: '公告更新成功'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  const auth = verifyAdmin(req);
  if (!auth.valid) {
    return res.status(403).json({ success: false, message: auth.message });
  }
  
  const id = req.params.id;
  
  try {
    await connection.execute('DELETE FROM announcements WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: '公告删除成功'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
