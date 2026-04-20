const { pool } = require('../db/connection');

const getProfile = async (req, res) => {
  try {
    const [users] = await pool.execute('SELECT id, username, nickname, email, avatar_url, role FROM users WHERE id = ?', [req.user.userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ message: '获取用户信息失败', error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { nickname, email, avatar_url } = req.body;
    
    await pool.execute('UPDATE users SET nickname = ?, email = ?, avatar_url = ? WHERE id = ?', [nickname, email, avatar_url, req.user.userId]);
    
    res.json({ message: '更新成功' });
  } catch (error) {
    res.status(500).json({ message: '更新失败', error: error.message });
  }
};

module.exports = { getProfile, updateProfile };
