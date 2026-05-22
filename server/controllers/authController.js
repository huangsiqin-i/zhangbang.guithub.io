const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { db } = require('../db/sqliteConnection');

function validateCredentials(username, password) {
  if (typeof username !== "string" || typeof password !== "string") {
    return "Username and password must be strings";
  }

  if (username.trim().length < 3 || username.trim().length > 20) {
    return "Username length must be between 3 and 20";
  }

  if (password.length < 6 || password.length > 64) {
    return "Password length must be between 6 and 64";
  }

  return null;
}

async function register(req, res) {
  const { username, password, email, nickname } = req.body;
  const validationError = validateCredentials(username, password);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const cleanUsername = username.trim();

  try {
    const existingUsers = await new Promise((resolve) => {
      db.all('SELECT id FROM users WHERE username = ?', [cleanUsername], (err, rows) => {
        if (err) resolve([]);
        else resolve(rows);
      });
    });
    
    if (existingUsers.length > 0) {
      return res.status(409).json({
        message: "Username already exists"
      });
    }

    if (email) {
      const existingEmails = await new Promise((resolve) => {
        db.all('SELECT id FROM users WHERE email = ?', [email], (err, rows) => {
          if (err) resolve([]);
          else resolve(rows);
        });
      });
      if (existingEmails.length > 0) {
        return res.status(409).json({
          message: "Email already exists"
        });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await new Promise((resolve) => {
      db.run('INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
        [cleanUsername, passwordHash, email, 'user'], function(err) {
          if (err) {
            console.log('插入用户失败:', err.message);
            resolve({ insertId: null });
          } else {
            console.log('插入用户成功, lastID:', this.lastID);
            resolve({ insertId: this.lastID });
          }
        });
    });

    return res.status(201).json({
      success: true,
      message: "Register success",
      user: {
        id: result.insertId,
        username: cleanUsername,
        role: 'user'
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Register failed",
      error: error.message
    });
  }
}

async function login(req, res) {
  const { username, password } = req.body;
  console.log('登录请求:', { username, passwordLength: password ? password.length : 0 });
  
  const validationError = validateCredentials(username, password);

  if (validationError) {
    console.log('验证失败:', validationError);
    return res.status(400).json({ message: validationError });
  }

  const cleanUsername = username.trim();
  console.log('清理后的用户名:', cleanUsername);

  try {
    const user = await new Promise((resolve) => {
      db.get('SELECT id, username, password, role FROM users WHERE username = ?',
        [cleanUsername], (err, row) => {
          if (err) {
            console.log('查询错误:', err.message);
            resolve(null);
          } else {
            console.log('查询结果:', row);
            resolve(row);
          }
        });
    });

    if (!user) {
      console.log('用户不存在');
      return res.status(401).json({
        message: "Invalid username or password"
      });
    }

    console.log('数据库中的密码哈希:', user.password);
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('密码验证结果:', isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid username or password"
      });
    }

    const jwtSecret = process.env.JWT_SECRET || "bondian_dev_secret";
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role
      },
      jwtSecret,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login success",
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        nickname: user.nickname || null
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Login failed",
      error: error.message
    });
  }
}

function getProfile(req, res) {
  return res.status(200).json({
    success: true,
    message: "Profile fetched",
    user: req.user
  });
}

async function updateProfile(req, res) {
  const { username, email, nickname, bio } = req.body;
  
  try {
    if (username) {
      const existingUsers = await new Promise((resolve) => {
        db.all('SELECT id FROM users WHERE username = ? AND id != ?',
          [username.trim(), req.user.id], (err, rows) => {
            if (err) resolve([]);
            else resolve(rows);
          });
      });
      if (existingUsers.length > 0) {
        return res.status(409).json({
          success: false,
          message: "Username already exists"
        });
      }
    }

    const updateFields = [];
    const updateParams = [];

    if (username) {
      updateFields.push('username = ?');
      updateParams.push(username.trim());
    }
    if (email) {
      updateFields.push('email = ?');
      updateParams.push(email);
    }
    if (nickname !== undefined) {
      updateFields.push('nickname = ?');
      updateParams.push(nickname);
    }
    if (bio !== undefined) {
      updateFields.push('bio = ?');
      updateParams.push(bio);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update"
      });
    }

    updateParams.push(req.user.id);

    await new Promise((resolve) => {
      db.run(`UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`, updateParams, () => resolve());
    });

    const updatedUser = await new Promise((resolve) => {
      db.get('SELECT id, username, email, nickname, role, bio FROM users WHERE id = ?',
        [req.user.id], (err, row) => {
          if (err) resolve(null);
          else resolve(row);
        });
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated",
      user: updatedUser
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Update failed",
      error: error.message
    });
  }
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};