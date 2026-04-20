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

exports.getLinks = async (req, res) => {
  try {
    const [rows] = await connection.execute(
      'SELECT * FROM links WHERE status = "active" ORDER BY sort_order ASC'
    );
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createLink = async (req, res) => {
  const auth = verifyAdmin(req);
  if (!auth.valid) {
    return res.status(403).json({ success: false, message: auth.message });
  }
  
  const { name, url, sort_order } = req.body;
  
  try {
    const [result] = await connection.execute(
      'INSERT INTO links (name, url, status, sort_order) VALUES (?, ?, "active", ?)',
      [name, url, sort_order || 0]
    );
    
    res.json({
      success: true,
      message: '友情链接添加成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateLink = async (req, res) => {
  const auth = verifyAdmin(req);
  if (!auth.valid) {
    return res.status(403).json({ success: false, message: auth.message });
  }
  
  const id = req.params.id;
  const { name, url, status, sort_order } = req.body;
  
  try {
    await connection.execute(
      'UPDATE links SET name = ?, url = ?, status = ?, sort_order = ? WHERE id = ?',
      [name, url, status, sort_order || 0, id]
    );
    
    res.json({
      success: true,
      message: '友情链接更新成功'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteLink = async (req, res) => {
  const auth = verifyAdmin(req);
  if (!auth.valid) {
    return res.status(403).json({ success: false, message: auth.message });
  }
  
  const id = req.params.id;
  
  try {
    await connection.execute('DELETE FROM links WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: '友情链接删除成功'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
