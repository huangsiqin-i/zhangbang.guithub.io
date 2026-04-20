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

exports.getMasters = async (req, res) => {
  try {
    const [rows] = await connection.execute(
      'SELECT * FROM masters ORDER BY sort_order ASC'
    );
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMasterById = async (req, res) => {
  const masterId = req.params.id;
  
  try {
    const [rows] = await connection.execute(
      'SELECT * FROM masters WHERE id = ?',
      [masterId]
    );
    
    if (rows.length === 0) {
      return res.json({ success: false, message: '传承人不存在' });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createMaster = async (req, res) => {
  const auth = verifyAdmin(req);
  if (!auth.valid) {
    return res.status(403).json({ success: false, message: auth.message });
  }
  
  const { name, title, region, birth_year, experience_years, story, achievements, works, photo, sort_order } = req.body;
  
  try {
    const [result] = await connection.execute(
      'INSERT INTO masters (name, title, region, birth_year, experience_years, story, achievements, works, photo, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, title || '', region || '', birth_year || null, experience_years || null, story || '', achievements || '', works || '', photo || '', sort_order || 0]
    );
    
    res.json({
      success: true,
      message: '传承人添加成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateMaster = async (req, res) => {
  const auth = verifyAdmin(req);
  if (!auth.valid) {
    return res.status(403).json({ success: false, message: auth.message });
  }
  
  const masterId = req.params.id;
  const { name, title, region, birth_year, experience_years, story, achievements, works, photo, sort_order } = req.body;
  
  try {
    await connection.execute(
      'UPDATE masters SET name = ?, title = ?, region = ?, birth_year = ?, experience_years = ?, story = ?, achievements = ?, works = ?, photo = ?, sort_order = ? WHERE id = ?',
      [name, title || '', region || '', birth_year || null, experience_years || null, story || '', achievements || '', works || '', photo || '', sort_order || 0, masterId]
    );
    
    res.json({
      success: true,
      message: '传承人更新成功'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteMaster = async (req, res) => {
  const auth = verifyAdmin(req);
  if (!auth.valid) {
    return res.status(403).json({ success: false, message: auth.message });
  }
  
  const masterId = req.params.id;
  
  try {
    await connection.execute('DELETE FROM masters WHERE id = ?', [masterId]);
    
    res.json({
      success: true,
      message: '传承人删除成功'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
