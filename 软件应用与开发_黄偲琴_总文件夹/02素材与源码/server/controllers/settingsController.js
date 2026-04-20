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

exports.getBanners = async (req, res) => {
  try {
    const [rows] = await connection.execute(
      'SELECT id, title, image_url, link_url, sort_order, created_at FROM banners ORDER BY sort_order ASC'
    );
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createBanner = async (req, res) => {
  const auth = verifyAdmin(req);
  if (!auth.valid) {
    return res.status(403).json({ success: false, message: auth.message });
  }
  
  const { title, image_url, link_url, sort_order } = req.body;
  
  try {
    const [result] = await connection.execute(
      'INSERT INTO banners (title, image_url, link_url, sort_order) VALUES (?, ?, ?, ?)',
      [title || '', image_url, link_url || '', sort_order || 0]
    );
    
    res.json({
      success: true,
      message: '轮播图添加成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBanner = async (req, res) => {
  const auth = verifyAdmin(req);
  if (!auth.valid) {
    return res.status(403).json({ success: false, message: auth.message });
  }
  
  const bannerId = req.params.id;
  const { title, image_url, link_url, sort_order } = req.body;
  
  try {
    await connection.execute(
      'UPDATE banners SET title = ?, image_url = ?, link_url = ?, sort_order = ? WHERE id = ?',
      [title || '', image_url, link_url || '', sort_order || 0, bannerId]
    );
    
    res.json({
      success: true,
      message: '轮播图更新成功'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteBanner = async (req, res) => {
  const auth = verifyAdmin(req);
  if (!auth.valid) {
    return res.status(403).json({ success: false, message: auth.message });
  }
  
  const bannerId = req.params.id;
  
  try {
    await connection.execute('DELETE FROM banners WHERE id = ?', [bannerId]);
    
    res.json({
      success: true,
      message: '轮播图删除成功'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getNotice = async (req, res) => {
  try {
    const [rows] = await connection.execute(
      'SELECT content FROM settings WHERE key_name = "site_notice"'
    );
    
    res.json({
      success: true,
      data: { content: rows.length > 0 ? rows[0].content : '' }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateNotice = async (req, res) => {
  const auth = verifyAdmin(req);
  if (!auth.valid) {
    return res.status(403).json({ success: false, message: auth.message });
  }
  
  const { content } = req.body;
  
  try {
    const [rows] = await connection.execute(
      'SELECT id FROM settings WHERE key_name = "site_notice"'
    );
    
    if (rows.length > 0) {
      await connection.execute(
        'UPDATE settings SET content = ? WHERE key_name = "site_notice"',
        [content]
      );
    } else {
      await connection.execute(
        'INSERT INTO settings (key_name, content) VALUES ("site_notice", ?)',
        [content]
      );
    }
    
    res.json({
      success: true,
      message: '公告更新成功'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
