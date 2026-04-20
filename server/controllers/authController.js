const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const connection = require('../db/connection');

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
    const [existingUsers] = await connection.query(
      'SELECT id FROM users WHERE username = ?',
      [cleanUsername]
    );
    
    if (existingUsers.length > 0) {
      return res.status(409).json({
        message: "Username already exists"
      });
    }

    if (email) {
      const [existingEmails] = await connection.query(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );
      if (existingEmails.length > 0) {
        return res.status(409).json({
          message: "Email already exists"
        });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await connection.query(
      'INSERT INTO users (username, password_hash, email, nickname, role) VALUES (?, ?, ?, ?, ?)',
      [cleanUsername, passwordHash, email, nickname, 'user']
    );

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
  const validationError = validateCredentials(username, password);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const cleanUsername = username.trim();

  try {
    const [users] = await connection.query(
      'SELECT id, username, password_hash, role, nickname, avatar_url FROM users WHERE username = ?',
      [cleanUsername]
    );

    if (users.length === 0) {
      return res.status(401).json({
        message: "Invalid username or password"
      });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

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
        nickname: user.nickname,
        avatar_url: user.avatar_url
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
  const { username, email, nickname, bio, avatar_url } = req.body;
  
  try {
    if (username) {
      const [existingUsers] = await connection.query(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username.trim(), req.user.id]
      );
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
    if (avatar_url) {
      updateFields.push('avatar_url = ?');
      updateParams.push(avatar_url);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update"
      });
    }

    updateParams.push(req.user.id);

    await connection.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    );

    const [users] = await connection.query(
      'SELECT id, username, email, nickname, role, bio, avatar_url FROM users WHERE id = ?',
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated",
      user: users[0]
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