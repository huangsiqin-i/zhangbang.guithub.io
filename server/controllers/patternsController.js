const { db } = require('../db/sqliteConnection');
const jwt = require('jsonwebtoken');

exports.getPatterns = async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM patterns WHERE 1=1';
    let params = [];
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY sort_order ASC, id DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const patterns = await new Promise((resolve) => {
      db.all(query, params, (err, rows) => {
        if (err) resolve([]);
        else resolve(rows);
      });
    });
    
    res.json({ success: true, data: patterns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPatternById = async (req, res) => {
  try {
    const { id } = req.params;
    const pattern = await new Promise((resolve) => {
      db.get('SELECT * FROM patterns WHERE id = ?', [id], (err, row) => {
        if (err) resolve(null);
        else resolve(row);
      });
    });
    
    if (!pattern) {
      return res.status(404).json({ success: false, message: '纹样不存在' });
    }
    
    res.json({ success: true, data: pattern });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createPattern = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET || 'bondian_dev_secret');
    
    const { name, category, description, imageUrl, symbolism, region, material, color, sort_order } = req.body;
    
    const result = await new Promise((resolve) => {
      db.run('INSERT INTO patterns (name, category, description, imageUrl, symbolism, region, material, color, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [name, category, description, imageUrl, symbolism, region, material, color, sort_order || 0], function(err) {
          if (err) resolve({ insertId: null });
          else resolve({ insertId: this.lastID });
        });
    });
    
    res.json({ 
      success: true, 
      message: '纹样创建成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePattern = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET || 'bondian_dev_secret');
    const { id } = req.params;
    
    const pattern = await new Promise((resolve) => {
      db.get('SELECT * FROM patterns WHERE id = ?', [id], (err, row) => {
        if (err) resolve(null);
        else resolve(row);
      });
    });
    
    if (!pattern) {
      return res.status(404).json({ success: false, message: '纹样不存在' });
    }
    
    const { name, category, description, imageUrl, symbolism, region, material, color, sort_order } = req.body;
    
    await new Promise((resolve) => {
      db.run('UPDATE patterns SET name = ?, category = ?, description = ?, imageUrl = ?, symbolism = ?, region = ?, material = ?, color = ?, sort_order = ? WHERE id = ?',
        [name, category, description, imageUrl, symbolism, region, material, color, sort_order || 0, id], () => resolve());
    });
    
    res.json({ success: true, message: '纹样更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deletePattern = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET || 'bondian_dev_secret');
    const { id } = req.params;
    
    await new Promise((resolve) => {
      db.run('DELETE FROM patterns WHERE id = ?', [id], () => resolve());
    });
    
    res.json({ success: true, message: '纹样删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePatternStatus = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET || 'bondian_dev_secret');
    const { id } = req.params;
    const { status } = req.body;
    
    await new Promise((resolve) => {
      db.run('UPDATE patterns SET status = ? WHERE id = ?', [status, id], () => resolve());
    });
    
    res.json({ success: true, message: '状态更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};