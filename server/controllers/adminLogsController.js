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

exports.getLogs = async (req, res) => {
  const auth = verifyAdmin(req);
  if (!auth.valid) {
    return res.status(403).json({ success: false, message: auth.message });
  }
  
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 20;
  const offset = (page - 1) * pageSize;
  
  try {
    const [countRows] = await connection.execute('SELECT COUNT(*) as total FROM admin_logs');
    const [rows] = await connection.execute(
      'SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [pageSize, offset]
    );
    
    res.json({
      success: true,
      data: rows,
      pagination: {
        page,
        pageSize,
        total: countRows[0].total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createLog = async (req, res) => {
  const auth = verifyAdmin(req);
  if (!auth.valid) {
    return res.status(403).json({ success: false, message: auth.message });
  }
  
  const { action, target_type, target_id, detail, ip_address } = req.body;
  
  try {
    await connection.execute(
      'INSERT INTO admin_logs (admin_id, action, target_type, target_id, detail, ip_address) VALUES (?, ?, ?, ?, ?, ?)',
      [auth.decoded.userId, action, target_type, target_id || null, detail || '', ip_address || '']
    );
    
    res.json({
      success: true,
      message: '日志记录成功'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 辅助函数：记录管理员操作日志
exports.logAction = async (userId, action, targetType, targetId, detail, ipAddress = '') => {
  try {
    await connection.execute(
      'INSERT INTO admin_logs (admin_id, action, target_type, target_id, detail, ip_address) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, action, targetType, targetId || null, detail || '', ipAddress]
    );
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
};
