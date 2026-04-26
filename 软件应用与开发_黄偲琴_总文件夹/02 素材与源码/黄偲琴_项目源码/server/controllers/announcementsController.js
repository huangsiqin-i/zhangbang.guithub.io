const { db } = require('../db/sqliteConnection');
const jwt = require('jsonwebtoken');

exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await new Promise((resolve) => {
      db.all('SELECT * FROM announcements ORDER BY createdAt DESC', [], (err, rows) => {
        if (err) resolve([]);
        else resolve(rows);
      });
    });
    
    res.json({ success: true, data: announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getActiveAnnouncement = async (req, res) => {
  try {
    const announcement = await new Promise((resolve) => {
      db.get('SELECT * FROM announcements ORDER BY createdAt DESC LIMIT 1', [], (err, row) => {
        if (err) resolve(null);
        else resolve(row);
      });
    });
    
    res.json({ success: true, data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await new Promise((resolve) => {
      db.get('SELECT * FROM announcements WHERE id = ?', [id], (err, row) => {
        if (err) resolve(null);
        else resolve(row);
      });
    });
    
    if (!announcement) {
      return res.status(404).json({ success: false, message: '公告不存在' });
    }
    
    res.json({ success: true, data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createAnnouncement = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET || 'bondian_dev_secret');
    
    const { title, content } = req.body;
    
    const result = await new Promise((resolve) => {
      db.run('INSERT INTO announcements (title, content) VALUES (?, ?)',
        [title, content], function(err) {
          if (err) resolve({ insertId: null });
          else resolve({ insertId: this.lastID });
        });
    });
    
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
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET || 'bondian_dev_secret');
    const { id } = req.params;
    
    const announcement = await new Promise((resolve) => {
      db.get('SELECT * FROM announcements WHERE id = ?', [id], (err, row) => {
        if (err) resolve(null);
        else resolve(row);
      });
    });
    
    if (!announcement) {
      return res.status(404).json({ success: false, message: '公告不存在' });
    }
    
    const { title, content } = req.body;
    
    await new Promise((resolve) => {
      db.run('UPDATE announcements SET title = ?, content = ? WHERE id = ?',
        [title, content, id], () => resolve());
    });
    
    res.json({ success: true, message: '公告更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET || 'bondian_dev_secret');
    const { id } = req.params;
    
    await new Promise((resolve) => {
      db.run('DELETE FROM announcements WHERE id = ?', [id], () => resolve());
    });
    
    res.json({ success: true, message: '公告删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};