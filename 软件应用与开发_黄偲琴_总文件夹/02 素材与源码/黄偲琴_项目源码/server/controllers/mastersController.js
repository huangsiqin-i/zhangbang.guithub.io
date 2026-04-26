const { db } = require('../db/sqliteConnection');
const jwt = require('jsonwebtoken');

exports.getMasters = async (req, res) => {
  try {
    const masters = await new Promise((resolve) => {
      db.all('SELECT * FROM masters ORDER BY sort_order ASC, id DESC', [], (err, rows) => {
        if (err) resolve([]);
        else resolve(rows);
      });
    });
    
    res.json({ success: true, data: masters });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMasterById = async (req, res) => {
  try {
    const { id } = req.params;
    const master = await new Promise((resolve) => {
      db.get('SELECT * FROM masters WHERE id = ?', [id], (err, row) => {
        if (err) resolve(null);
        else resolve(row);
      });
    });
    
    if (!master) {
      return res.status(404).json({ success: false, message: '传承人不存在' });
    }
    
    res.json({ success: true, data: master });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createMaster = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET || 'bondian_dev_secret');
    
    const { 
      name, 
      title, 
      avatarUrl, 
      bio, 
      works, 
      region,
      birth_year,
      death_year,
      experience_years,
      is_deceased,
      sort_order,
      achievements,
      story,
      quotes,
      skills,
      status
    } = req.body;
    
    const result = await new Promise((resolve) => {
      db.run(
        'INSERT INTO masters (name, title, avatarUrl, bio, works, region, birth_year, death_year, experience_years, is_deceased, sort_order, achievements, story, quotes, skills, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [name, title, avatarUrl, bio, works, region, birth_year, death_year, experience_years, is_deceased || 0, sort_order || 0, achievements, story, quotes, skills, status || 'active'], 
        function(err) {
          if (err) resolve({ insertId: null });
          else resolve({ insertId: this.lastID });
        });
    });
    
    res.json({ 
      success: true, 
      message: '传承人创建成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateMaster = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET || 'bondian_dev_secret');
    const { id } = req.params;
    
    const master = await new Promise((resolve) => {
      db.get('SELECT * FROM masters WHERE id = ?', [id], (err, row) => {
        if (err) resolve(null);
        else resolve(row);
      });
    });
    
    if (!master) {
      return res.status(404).json({ success: false, message: '传承人不存在' });
    }
    
    const { 
      name, 
      title, 
      avatarUrl, 
      bio, 
      works, 
      region,
      birth_year,
      death_year,
      experience_years,
      is_deceased,
      sort_order,
      achievements,
      story,
      quotes,
      skills,
      status
    } = req.body;
    
    await new Promise((resolve) => {
      db.run(
        'UPDATE masters SET name = ?, title = ?, avatarUrl = ?, bio = ?, works = ?, region = ?, birth_year = ?, death_year = ?, experience_years = ?, is_deceased = ?, sort_order = ?, achievements = ?, story = ?, quotes = ?, skills = ?, status = ? WHERE id = ?',
        [name, title, avatarUrl, bio, works, region, birth_year, death_year, experience_years, is_deceased || 0, sort_order || 0, achievements, story, quotes, skills, status || 'active', id], 
        () => resolve());
    });
    
    res.json({ success: true, message: '传承人更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteMaster = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET || 'bondian_dev_secret');
    const { id } = req.params;
    
    await new Promise((resolve) => {
      db.run('DELETE FROM masters WHERE id = ?', [id], () => resolve());
    });
    
    res.json({ success: true, message: '传承人删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};