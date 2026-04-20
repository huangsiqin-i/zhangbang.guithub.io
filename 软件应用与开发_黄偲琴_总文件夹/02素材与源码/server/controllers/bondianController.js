const connection = require('../db/connection');
const jwt = require('jsonwebtoken');

exports.getAllBondians = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, region, keyword } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT b.*, bt.name as type_name, bt.color_code, r.name as region_name 
      FROM bondians b 
      LEFT JOIN bondian_types bt ON b.type_id = bt.id 
      LEFT JOIN regions r ON b.region = r.name 
      WHERE b.status = 'approved'
    `;
    let params = [];
    
    if (type) {
      query += ' AND bt.name = ?';
      params.push(type);
    }
    
    if (region) {
      query += ' AND b.region = ?';
      params.push(region);
    }
    
    if (keyword) {
      query += ' AND (b.name LIKE ? OR b.color_description LIKE ? OR b.pattern_description LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }
    
    query += ' ORDER BY b.popularity DESC, b.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [bondians] = await connection.query(query, params);
    
    const countQuery = query.replace(/ORDER BY.*$/, '');
    const [countResult] = await connection.query(`SELECT COUNT(*) as total FROM (${countQuery}) as temp`, params.slice(0, -2));
    
    res.json({
      success: true,
      data: bondians,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBondianById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [bondians] = await connection.query(
      `SELECT b.*, bt.name as type_name, bt.color_code, r.name as region_name 
       FROM bondians b 
       LEFT JOIN bondian_types bt ON b.type_id = bt.id 
       LEFT JOIN regions r ON b.region = r.name 
       WHERE b.id = ? AND b.status = 'approved'`,
      [id]
    );
    
    if (bondians.length === 0) {
      return res.status(404).json({ success: false, message: '邦典不存在' });
    }
    
    await connection.query(
      'UPDATE bondians SET popularity = popularity + 1 WHERE id = ?',
      [id]
    );
    
    res.json({ success: true, data: bondians[0] });
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
    const userId = decoded.userId;
    
    const { 
      name, type_id, region, material, craftsmanship, 
      color_description, pattern_description, image_url, 
      origin_description, cultural_significance, usage_scenario 
    } = req.body;
    
    const [result] = await connection.query(
      `INSERT INTO bondians (name, type_id, region, material, craftsmanship, 
        color_description, pattern_description, image_url, 
        origin_description, cultural_significance, usage_scenario, author_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, type_id, region, material, craftsmanship, 
       color_description, pattern_description, image_url, 
       origin_description, cultural_significance, usage_scenario, userId]
    );
    
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
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bondian_dev_secret');
    const userId = decoded.userId;
    const { id } = req.params;
    
    const [bondians] = await connection.query('SELECT author_id, status FROM bondians WHERE id = ?', [id]);
    if (bondians.length === 0) {
      return res.status(404).json({ success: false, message: '邦典不存在' });
    }
    
    if (bondians[0].author_id !== userId) {
      return res.status(403).json({ success: false, message: '无权限修改' });
    }
    
    const { 
      name, type_id, region, material, craftsmanship, 
      color_description, pattern_description, image_url, 
      origin_description, cultural_significance, usage_scenario 
    } = req.body;
    
    await connection.query(
      `UPDATE bondians SET name = ?, type_id = ?, region = ?, material = ?, craftsmanship = ?, 
        color_description = ?, pattern_description = ?, image_url = ?, 
        origin_description = ?, cultural_significance = ?, usage_scenario = ?
       WHERE id = ?`,
      [name, type_id, region, material, craftsmanship, 
       color_description, pattern_description, image_url, 
       origin_description, cultural_significance, usage_scenario, id]
    );
    
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
    const userId = decoded.userId;
    const userRole = decoded.role;
    const { id } = req.params;
    
    const [bondians] = await connection.query('SELECT author_id FROM bondians WHERE id = ?', [id]);
    if (bondians.length === 0) {
      return res.status(404).json({ success: false, message: '邦典不存在' });
    }
    
    if (bondians[0].author_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ success: false, message: '无权限删除' });
    }
    
    await connection.query('DELETE FROM bondians WHERE id = ?', [id]);
    
    res.json({ success: true, message: '邦典删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBondianTypes = async (req, res) => {
  try {
    const [types] = await connection.query('SELECT * FROM bondian_types ORDER BY id');
    res.json({ success: true, data: types });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRegions = async (req, res) => {
  try {
    const [regions] = await connection.query('SELECT * FROM regions ORDER BY id');
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
    
    const [patterns] = await connection.query(
      'SELECT * FROM patterns ORDER BY sort_order ASC'
    );
    
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
    await connection.query('DELETE FROM patterns WHERE id = ?', [id]);
    
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
