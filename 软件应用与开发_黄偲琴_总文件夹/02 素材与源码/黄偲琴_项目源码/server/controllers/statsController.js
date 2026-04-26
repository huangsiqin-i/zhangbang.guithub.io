const { db } = require('../db/sqliteConnection');
const jwt = require('jsonwebtoken');

exports.getRegionStats = async (req, res) => {
  try {
    const rows = await new Promise((resolve) => {
      db.all('SELECT region, COUNT(*) as count FROM bondians WHERE region IS NOT NULL GROUP BY region', [], (err, rows) => {
        if (err) resolve([]);
        else resolve(rows);
      });
    });
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const workCount = await new Promise((resolve) => {
      db.get('SELECT COUNT(*) as total FROM works', [], (err, row) => {
        if (err) resolve({ total: 0 });
        else resolve(row);
      });
    });
    
    const userCount = await new Promise((resolve) => {
      db.get('SELECT COUNT(*) as total FROM users', [], (err, row) => {
        if (err) resolve({ total: 0 });
        else resolve(row);
      });
    });
    
    const commentCount = await new Promise((resolve) => {
      db.get('SELECT COUNT(*) as total FROM comments', [], (err, row) => {
        if (err) resolve({ total: 0 });
        else resolve(row);
      });
    });
    
    const favoriteCount = await new Promise((resolve) => {
      db.get('SELECT COUNT(*) as total FROM favorites', [], (err, row) => {
        if (err) resolve({ total: 0 });
        else resolve(row);
      });
    });
    
    const bondianCount = await new Promise((resolve) => {
      db.get('SELECT COUNT(*) as total FROM bondians', [], (err, row) => {
        if (err) resolve({ total: 0 });
        else resolve(row);
      });
    });
    
    const patternCount = await new Promise((resolve) => {
      db.get('SELECT COUNT(*) as total FROM patterns', [], (err, row) => {
        if (err) resolve({ total: 0 });
        else resolve(row);
      });
    });
    
    const regionStats = await new Promise((resolve) => {
      db.all('SELECT region, COUNT(id) as count FROM bondians WHERE region IS NOT NULL GROUP BY region ORDER BY count DESC', [], (err, rows) => {
        if (err) resolve([]);
        else resolve(rows);
      });
    });
    
    res.json({
      success: true,
      data: {
        totalBondians: bondianCount.total,
        totalUsers: userCount.total,
        totalComments: commentCount.total,
        totalFavorites: favoriteCount.total,
        workCount: workCount.total,
        patternCount: patternCount.total,
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
    
    const bondianCount = await new Promise((resolve) => {
      db.get('SELECT COUNT(*) as total FROM bondians', [], (err, row) => {
        if (err) resolve({ total: 0 });
        else resolve(row);
      });
    });
    
    const userCount = await new Promise((resolve) => {
      db.get('SELECT COUNT(*) as total FROM users', [], (err, row) => {
        if (err) resolve({ total: 0 });
        else resolve(row);
      });
    });
    
    const commentCount = await new Promise((resolve) => {
      db.get('SELECT COUNT(*) as total FROM comments', [], (err, row) => {
        if (err) resolve({ total: 0 });
        else resolve(row);
      });
    });
    
    const workCount = await new Promise((resolve) => {
      db.get('SELECT COUNT(*) as total FROM works', [], (err, row) => {
        if (err) resolve({ total: 0 });
        else resolve(row);
      });
    });
    
    const patternCount = await new Promise((resolve) => {
      db.get('SELECT COUNT(*) as total FROM patterns', [], (err, row) => {
        if (err) resolve({ total: 0 });
        else resolve(row);
      });
    });
    
    const regionStats = await new Promise((resolve) => {
      db.all('SELECT region, COUNT(id) as count FROM bondians WHERE region IS NOT NULL GROUP BY region ORDER BY count DESC', [], (err, rows) => {
        if (err) resolve([]);
        else resolve(rows);
      });
    });
    
    // 获取最近添加的邦典
    const recentBondians = await new Promise((resolve) => {
      db.all('SELECT b.id, b.name, b.region, b.created_at, u.username FROM bondians b LEFT JOIN users u ON u.id = b.author_id ORDER BY b.created_at DESC LIMIT 10', [], (err, rows) => {
        if (err) resolve([]);
        else resolve(rows);
      });
    });
    
    res.json({
      success: true,
      data: {
        newUsers: 0,
        recentBondians,
        totalBondians: workCount.total,
        totalUsers: userCount.total,
        totalComments: commentCount.total,
        workCount: workCount.total,
        patternCount: patternCount.total,
        declarationCount: 0,
        typeStats: [],
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
    const userId = decoded.id;
    
    const bondianCount = await new Promise((resolve) => {
      db.get('SELECT COUNT(*) as total FROM bondians WHERE author_id = ?', [userId], (err, row) => {
        if (err) resolve({ total: 0 });
        else resolve(row);
      });
    });
    
    const favoriteCount = await new Promise((resolve) => {
      db.get('SELECT COUNT(*) as total FROM favorites WHERE userId = ?', [userId], (err, row) => {
        if (err) resolve({ total: 0 });
        else resolve(row);
      });
    });
    
    const commentCount = await new Promise((resolve) => {
      db.get('SELECT COUNT(*) as total FROM comments WHERE userId = ?', [userId], (err, row) => {
        if (err) resolve({ total: 0 });
        else resolve(row);
      });
    });
    
    res.json({
      success: true,
      data: {
        totalBondians: bondianCount.total,
        totalFavorites: favoriteCount.total,
        totalComments: commentCount.total
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
    
    const users = await new Promise((resolve) => {
      db.all('SELECT id, username, email, role FROM users ORDER BY id DESC', [], (err, rows) => {
        if (err) resolve([]);
        else resolve(rows);
      });
    });
    
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
    await new Promise((resolve) => {
      db.run('UPDATE users SET role = "admin" WHERE id = ?', [userId], () => resolve());
    });
    
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
    await new Promise((resolve) => {
      db.run('UPDATE users SET role = "user" WHERE id = ?', [userId], () => resolve());
    });
    
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
    await new Promise((resolve) => {
      db.run('UPDATE users SET role = "banned" WHERE id = ?', [userId], () => resolve());
    });
    
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
    await new Promise((resolve) => {
      db.run('UPDATE users SET role = "user" WHERE id = ?', [userId], () => resolve());
    });
    
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
    
    await new Promise((resolve) => { db.run('DELETE FROM favorites WHERE userId = ?', [userId], () => resolve()); });
    await new Promise((resolve) => { db.run('DELETE FROM comments WHERE userId = ?', [userId], () => resolve()); });
    await new Promise((resolve) => { db.run('DELETE FROM users WHERE id = ?', [userId], () => resolve()); });
    
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};