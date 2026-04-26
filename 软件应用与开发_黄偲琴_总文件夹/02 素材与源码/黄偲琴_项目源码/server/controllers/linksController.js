const { db } = require('../db/sqliteConnection');
const jwt = require('jsonwebtoken');

exports.getLinks = async (req, res) => {
  try {
    const links = await new Promise((resolve) => {
      db.all('SELECT * FROM links ORDER BY id DESC', [], (err, rows) => {
        if (err) resolve([]);
        else resolve(rows);
      });
    });
    
    res.json({ success: true, data: links });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLinkById = async (req, res) => {
  try {
    const { id } = req.params;
    const link = await new Promise((resolve) => {
      db.get('SELECT * FROM links WHERE id = ?', [id], (err, row) => {
        if (err) resolve(null);
        else resolve(row);
      });
    });
    
    if (!link) {
      return res.status(404).json({ success: false, message: '链接不存在' });
    }
    
    res.json({ success: true, data: link });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createLink = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET || 'bondian_dev_secret');
    
    const { name, url, description } = req.body;
    
    const result = await new Promise((resolve) => {
      db.run('INSERT INTO links (name, url, description) VALUES (?, ?, ?)',
        [name, url, description], function(err) {
          if (err) resolve({ insertId: null });
          else resolve({ insertId: this.lastID });
        });
    });
    
    res.json({ 
      success: true, 
      message: '链接创建成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateLink = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET || 'bondian_dev_secret');
    const { id } = req.params;
    
    const link = await new Promise((resolve) => {
      db.get('SELECT * FROM links WHERE id = ?', [id], (err, row) => {
        if (err) resolve(null);
        else resolve(row);
      });
    });
    
    if (!link) {
      return res.status(404).json({ success: false, message: '链接不存在' });
    }
    
    const { name, url, description } = req.body;
    
    await new Promise((resolve) => {
      db.run('UPDATE links SET name = ?, url = ?, description = ? WHERE id = ?',
        [name, url, description, id], () => resolve());
    });
    
    res.json({ success: true, message: '链接更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteLink = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET || 'bondian_dev_secret');
    const { id } = req.params;
    
    await new Promise((resolve) => {
      db.run('DELETE FROM links WHERE id = ?', [id], () => resolve());
    });
    
    res.json({ success: true, message: '链接删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};