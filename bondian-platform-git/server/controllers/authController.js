const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db/connection');

const register = async (req, res) => {
  try {
    const { username, password, email, nickname } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.execute(
      'INSERT INTO users (username, password_hash, email, nickname, role) VALUES (?, ?, ?, ?, ?)',
      [username, hashedPassword, email, nickname || username, 'user']
    );
    
    res.status(201).json({ message: '注册成功', userId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: '注册失败', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const [users] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
    
    if (users.length === 0) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }
    
    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }
    
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      message: '登录成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        role: user.role,
        avatar_url: user.avatar_url
      }
    });
  } catch (error) {
    res.status(500).json({ message: '登录失败', error: error.message });
  }
};

const verifyToken = (req, res) => {
  res.json({ message: 'token有效', user: req.user });
};

module.exports = { register, login, verifyToken };
