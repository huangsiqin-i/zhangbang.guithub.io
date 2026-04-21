const { db } = require('../db/sqliteConnection');
const jwt = require('jsonwebtoken');

exports.getAllBondians = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, region, keyword } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM bondians WHERE 1=1';
    let params = [];
    
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    
    if (region) {
      query += ' AND region = ?';
      params.push(region);
    }
    
    if (keyword) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    
    query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const bondians = await new Promise((resolve) => {
      db.all(query, params, (err, rows) => {
        if (err) resolve([]);
        else resolve(rows);
      });
    });
    
    const countResult = await new Promise((resolve) => {
      db.get('SELECT COUNT(*) as total FROM bondians', [], (err, row) => {
        if (err) resolve({ total: 0 });
        else resolve(row);
      });
    });
    
    res.json({
      success: true,
      data: bondians,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult.total,
        pages: Math.ceil(countResult.total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBondianById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const bondian = await new Promise((resolve) => {
      db.get('SELECT * FROM bondians WHERE id = ?', [id], (err, row) => {
        if (err) resolve(null);
        else resolve(row);
      });
    });
    
    if (!bondian) {
      return res.status(404).json({ success: false, message: '邦典不存在' });
    }
    
    res.json({ success: true, data: bondian });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createBondian = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bondian_dev_secret');
    
    const { name, type, region, description, imageUrl, colors, patterns, origin, culturalSignificance } = req.body;
    
    const result = await new Promise((resolve) => {
      db.run('INSERT INTO bondians (name, type, region, description, imageUrl, colors, patterns, origin, culturalSignificance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [name, type, region, description, imageUrl, colors, patterns, origin, culturalSignificance],
        function(err) {
          if (err) resolve({ insertId: null });
          else resolve({ insertId: this.lastID });
        });
    });
    
    res.json({ 
      success: true, 
      message: '邦典创建成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBondian = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET || 'bondian_dev_secret');
    const { id } = req.params;
    
    const bondian = await new Promise((resolve) => {
      db.get('SELECT * FROM bondians WHERE id = ?', [id], (err, row) => {
        if (err) resolve(null);
        else resolve(row);
      });
    });
    
    if (!bondian) {
      return res.status(404).json({ success: false, message: '邦典不存在' });
    }
    
    const { name, type, region, description, imageUrl, colors, patterns, origin, culturalSignificance } = req.body;
    
    await new Promise((resolve) => {
      db.run('UPDATE bondians SET name = ?, type = ?, region = ?, description = ?, imageUrl = ?, colors = ?, patterns = ?, origin = ?, culturalSignificance = ? WHERE id = ?',
        [name, type, region, description, imageUrl, colors, patterns, origin, culturalSignificance, id], () => resolve());
    });
    
    res.json({ success: true, message: '邦典更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteBondian = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bondian_dev_secret');
    const { id } = req.params;
    
    const bondian = await new Promise((resolve) => {
      db.get('SELECT * FROM bondians WHERE id = ?', [id], (err, row) => {
        if (err) resolve(null);
        else resolve(row);
      });
    });
    
    if (!bondian) {
      return res.status(404).json({ success: false, message: '邦典不存在' });
    }
    
    await new Promise((resolve) => {
      db.run('DELETE FROM bondians WHERE id = ?', [id], () => resolve());
    });
    
    res.json({ success: true, message: '邦典删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBondianTypes = async (req, res) => {
  try {
    const types = await new Promise((resolve) => {
      db.all('SELECT DISTINCT type FROM bondians', [], (err, rows) => {
        if (err) resolve([]);
        else resolve(rows.map(r => ({ name: r.type })));
      });
    });
    res.json({ success: true, data: types });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRegions = async (req, res) => {
  try {
    const regions = await new Promise((resolve) => {
      db.all('SELECT DISTINCT region FROM bondians', [], (err, rows) => {
        if (err) resolve([]);
        else resolve(rows.map(r => ({ name: r.region })));
      });
    });
    res.json({ success: true, data: regions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAdminPatterns = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bondian_dev_secret');
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: '无权限' });
    }
    
    const patterns = await new Promise((resolve) => {
      db.all('SELECT * FROM patterns ORDER BY id ASC', [], (err, rows) => {
        if (err) resolve([]);
        else resolve(rows);
      });
    });
    
    res.json({ success: true, data: patterns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAdminPattern = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bondian_dev_secret');
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: '无权限' });
    }
    
    const { id } = req.params;
    await new Promise((resolve) => {
      db.run('DELETE FROM patterns WHERE id = ?', [id], () => resolve());
    });
    
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};