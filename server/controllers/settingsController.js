const { db } = require('../db/sqliteConnection');
const jwt = require('jsonwebtoken');

exports.getSettings = async (req, res) => {
  try {
    const settings = await new Promise((resolve) => {
      db.all('SELECT * FROM settings', [], (err, rows) => {
        if (err) resolve([]);
        else resolve(rows);
      });
    });
    
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSetting = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET || 'bondian_dev_secret');
    
    const { key, value, description } = req.body;
    
    await new Promise((resolve) => {
      db.run('INSERT OR REPLACE INTO settings (key, value, description) VALUES (?, ?, ?)',
        [key, value, description], () => resolve());
    });
    
    res.json({ success: true, message: '设置更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteSetting = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET || 'bondian_dev_secret');
    const { key } = req.params;
    
    await new Promise((resolve) => {
      db.run('DELETE FROM settings WHERE key = ?', [key], () => resolve());
    });
    
    res.json({ success: true, message: '设置删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBanners = async (req, res) => {
  try {
    const banners = await new Promise((resolve) => {
      db.all('SELECT * FROM banners ORDER BY id DESC', [], (err, rows) => {
        if (err) resolve([]);
        else resolve(rows);
      });
    });
    res.json({ success: true, data: banners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createBanner = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bondian_dev_secret');
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: '无权限' });
    }
    
    const { imageUrl, link, title } = req.body;
    const result = await new Promise((resolve) => {
      db.run('INSERT INTO banners (image_url, link, title) VALUES (?, ?, ?)',
        [imageUrl, link, title], function(err) {
          if (err) resolve({ insertId: null });
          else resolve({ insertId: this.lastID });
        });
    });
    
    res.json({ success: true, message: '创建成功', data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bondian_dev_secret');
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: '无权限' });
    }
    
    const bannerId = req.params.id;
    const { imageUrl, link, title } = req.body;
    
    await new Promise((resolve) => {
      db.run('UPDATE banners SET image_url = ?, link = ?, title = ? WHERE id = ?',
        [imageUrl, link, title, bannerId], () => resolve());
    });
    
    res.json({ success: true, message: '更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bondian_dev_secret');
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: '无权限' });
    }
    
    const bannerId = req.params.id;
    await new Promise((resolve) => {
      db.run('DELETE FROM banners WHERE id = ?', [bannerId], () => resolve());
    });
    
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getNotice = async (req, res) => {
  try {
    const notice = await new Promise((resolve) => {
      db.get('SELECT * FROM settings WHERE key = "notice"', [], (err, row) => {
        if (err) resolve(null);
        else resolve(row);
      });
    });
    res.json({ success: true, data: notice ? notice.value : '' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateNotice = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bondian_dev_secret');
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: '无权限' });
    }
    
    const { value } = req.body;
    await new Promise((resolve) => {
      db.run('INSERT OR REPLACE INTO settings (key, value, description) VALUES (?, ?, ?)',
        ['notice', value, '系统公告'], () => resolve());
    });
    
    res.json({ success: true, message: '公告更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};