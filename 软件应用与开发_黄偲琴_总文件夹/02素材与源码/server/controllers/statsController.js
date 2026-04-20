const connection = require('../db/connection');
const jwt = require('jsonwebtoken');

// 获取地区热力图数据
exports.getRegionStats = async (req, res) => {
  try {
    const [rows] = await connection.query(
      'SELECT name, value, workshops, museums, visitors, description, famous_spots, color FROM region_stats ORDER BY value DESC'
    );
    
    const result = rows.map(row => ({
      name: row.name,
      value: row.value,
      workshops: row.workshops,
      museums: row.museums,
      visitors: row.visitors,
      description: row.description,
      famousSpots: row.famous_spots ? row.famous_spots.split(',') : [],
      color: row.color
    }));
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [workCount] = await connection.query(
      'SELECT COUNT(*) as total FROM works'
    );
    
    const [userCount] = await connection.query(
      'SELECT COUNT(*) as total FROM users'
    );
    
    const [commentCount] = await connection.query(
      'SELECT COUNT(*) as total FROM comments'
    );
    
    const [favoriteCount] = await connection.query(
      'SELECT COUNT(*) as total FROM favorites'
    );
    
    const [bondianCount] = await connection.query(
      'SELECT COUNT(*) as total FROM bondians'
    );
    
    const [patternCount] = await connection.query(
      'SELECT COUNT(*) as total FROM patterns'
    );
    
    const [regionStats] = await connection.query(
      `SELECT b.region, COUNT(b.id) as count 
       FROM bondians b 
       WHERE b.region IS NOT NULL 
       GROUP BY b.region ORDER BY count DESC`
    );
    
    res.json({
      success: true,
      data: {
        totalBondians: bondianCount[0].total,
        totalUsers: userCount[0].total,
        totalComments: commentCount[0].total,
        totalFavorites: favoriteCount[0].total,
        workCount: workCount[0].total,
        patternCount: patternCount[0].total,
        declarationCount: 0,
        regionStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAdminStats = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bondian_dev_secret');
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: '无权限' });
    }
    
    const [newUsers] = await connection.query(
      'SELECT COUNT(*) as total FROM users WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)'
    );
    
    const [recentBondians] = await connection.query(
      `SELECT b.id, b.name, b.created_at, u.username 
       FROM bondians b 
       LEFT JOIN users u ON b.author_id = u.id 
       ORDER BY b.created_at DESC LIMIT 10`
    );
    
    const [bondianCount] = await connection.query(
      'SELECT COUNT(*) as total FROM bondians'
    );
    
    const [userCount] = await connection.query(
      'SELECT COUNT(*) as total FROM users'
    );
    
    const [commentCount] = await connection.query(
      'SELECT COUNT(*) as total FROM comments'
    );
    
    const [workCount] = await connection.query(
      'SELECT COUNT(*) as total FROM works'
    );
    
    const [patternCount] = await connection.query(
      'SELECT COUNT(*) as total FROM patterns'
    );
    
    const [typeStats] = await connection.query(
      `SELECT bt.name, COUNT(b.id) as count 
       FROM bondian_types bt 
       LEFT JOIN bondians b ON bt.id = b.type_id 
       GROUP BY bt.id, bt.name ORDER BY count DESC`
    );
    
    const [regionStats] = await connection.query(
      `SELECT b.region, COUNT(b.id) as count 
       FROM bondians b 
       WHERE b.region IS NOT NULL 
       GROUP BY b.region ORDER BY count DESC`
    );
    
    res.json({
      success: true,
      data: {
        newUsers: newUsers[0].total,
        recentBondians,
        totalBondians: bondianCount[0].total,
        totalUsers: userCount[0].total,
        totalComments: commentCount[0].total,
        workCount: workCount[0].total,
        patternCount: patternCount[0].total,
        declarationCount: 0,
        typeStats,
        regionStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bondian_dev_secret');
    const userId = decoded.userId;
    
    const [bondianCount] = await connection.query(
      'SELECT COUNT(*) as total FROM bondians WHERE author_id = ?',
      [userId]
    );
    
    const [favoriteCount] = await connection.query(
      'SELECT COUNT(*) as total FROM favorites WHERE user_id = ?',
      [userId]
    );
    
    const [commentCount] = await connection.query(
      'SELECT COUNT(*) as total FROM comments WHERE user_id = ?',
      [userId]
    );
    
    res.json({
      success: true,
      data: {
        totalBondians: bondianCount[0].total,
        totalFavorites: favoriteCount[0].total,
        totalComments: commentCount[0].total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUsersList = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bondian_dev_secret');
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: '无权限' });
    }
    
    const [users] = await connection.query(
      'SELECT id, username, email, role, status, created_at FROM users ORDER BY created_at DESC'
    );
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.promoteUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bondian_dev_secret');
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: '无权限' });
    }
    
    const userId = req.params.id;
    await connection.query(
      'UPDATE users SET role = "admin" WHERE id = ?',
      [userId]
    );
    
    res.json({ success: true, message: '升级成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.demoteUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bondian_dev_secret');
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: '无权限' });
    }
    
    const userId = req.params.id;
    await connection.query(
      'UPDATE users SET role = "user" WHERE id = ?',
      [userId]
    );
    
    res.json({ success: true, message: '降级成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.banUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bondian_dev_secret');
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: '无权限' });
    }
    
    const userId = req.params.id;
    await connection.query(
      'UPDATE users SET status = "banned" WHERE id = ?',
      [userId]
    );
    
    res.json({ success: true, message: '封禁成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.unbanUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bondian_dev_secret');
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: '无权限' });
    }
    
    const userId = req.params.id;
    await connection.query(
      'UPDATE users SET status = "active" WHERE id = ?',
      [userId]
    );
    
    res.json({ success: true, message: '解封成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bondian_dev_secret');
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: '无权限' });
    }
    
    const userId = req.params.id;
    
    await connection.query('DELETE FROM favorites WHERE user_id = ?', [userId]);
    await connection.query('DELETE FROM comments WHERE user_id = ?', [userId]);
    await connection.query('DELETE FROM works WHERE author_id = ?', [userId]);
    await connection.query('DELETE FROM users WHERE id = ?', [userId]);
    
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
