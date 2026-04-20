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

exports.getPatterns = async (req, res) => {
  const status = req.query.status;
  
  try {
    let query = 'SELECT * FROM patterns ORDER BY sort_order ASC';
    let params = [];
    
    if (status) {
      query = 'SELECT * FROM patterns WHERE status = ? ORDER BY sort_order ASC';
      params = [status];
    }
    
    const [rows] = await connection.execute(query, params);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPatternById = async (req, res) => {
  const id = req.params.id;
  
  try {
    const [rows] = await connection.execute(
      'SELECT * FROM patterns WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) {
      return res.json({ success: false, message: '样式不存在' });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createPattern = async (req, res) => {
  const auth = verifyAdmin(req);
  if (!auth.valid) {
    return res.status(403).json({ success: false, message: auth.message });
  }
  
  const { name, region, material, craftsmanship, color, pattern, image_url, description, cultural_significance, sort_order } = req.body;
  
  try {
    const [result] = await connection.execute(
      'INSERT INTO patterns (name, region, material, craftsmanship, color, pattern, image_url, description, cultural_significance, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, region || '', material || '', craftsmanship || '', color || '', pattern || '', image_url || '', description || '', cultural_significance || '', sort_order || 0]
    );
    
    res.json({
      success: true,
      message: '样式添加成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePattern = async (req, res) => {
  const auth = verifyAdmin(req);
  if (!auth.valid) {
    return res.status(403).json({ success: false, message: auth.message });
  }
  
  const id = req.params.id;
  const { name, region, material, craftsmanship, color, pattern, image_url, description, cultural_significance, sort_order } = req.body;
  
  try {
    await connection.execute(
      'UPDATE patterns SET name = ?, region = ?, material = ?, craftsmanship = ?, color = ?, pattern = ?, image_url = ?, description = ?, cultural_significance = ?, sort_order = ? WHERE id = ?',
      [name, region || '', material || '', craftsmanship || '', color || '', pattern || '', image_url || '', description || '', cultural_significance || '', sort_order || 0, id]
    );
    
    res.json({
      success: true,
      message: '样式更新成功'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deletePattern = async (req, res) => {
  const auth = verifyAdmin(req);
  if (!auth.valid) {
    return res.status(403).json({ success: false, message: auth.message });
  }
  
  const id = req.params.id;
  
  try {
    await connection.execute('DELETE FROM patterns WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: '样式删除成功'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePatternStatus = async (req, res) => {
  const auth = verifyAdmin(req);
  if (!auth.valid) {
    return res.status(403).json({ success: false, message: auth.message });
  }
  
  const id = req.params.id;
  const { status } = req.body;
  
  try {
    await connection.execute(
      'UPDATE patterns SET status = ? WHERE id = ?',
      [status, id]
    );
    
    res.json({
      success: true,
      message: '状态更新成功'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
