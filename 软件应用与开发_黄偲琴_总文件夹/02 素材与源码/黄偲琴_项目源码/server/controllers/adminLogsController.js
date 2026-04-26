const { db } = require('../db/sqliteConnection');
const jwt = require('jsonwebtoken');

exports.getLogs = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET || 'bondian_dev_secret');
    
    const logs = await new Promise((resolve) => {
      db.all('SELECT * FROM adminLogs ORDER BY createdAt DESC', [], (err, rows) => {
        if (err) resolve([]);
        else resolve(rows);
      });
    });
    
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createLog = async (action, target, operator) => {
  await new Promise((resolve) => {
    db.run('INSERT INTO adminLogs (action, target, operator) VALUES (?, ?, ?)',
      [action, target, operator], () => resolve());
  });
};

exports.clearLogs = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET || 'bondian_dev_secret');
    
    await new Promise((resolve) => {
      db.run('DELETE FROM adminLogs', [], () => resolve());
    });
    
    res.json({ success: true, message: '日志清空成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};