const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db/connection");

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
  const { username, password } = req.body;
  const validationError = validateCredentials(username, password);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const cleanUsername = username.trim();

  try {
    const [existingRows] = await pool.query(
      "SELECT id FROM users WHERE username = ? LIMIT 1",
      [cleanUsername]
    );

    if (existingRows.length > 0) {
      return res.status(409).json({
        message: "Username already exists"
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [insertResult] = await pool.query(
      "INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'user')",
      [cleanUsername, passwordHash]
    );

    return res.status(201).json({
      message: "Register success",
      user: {
        id: insertResult.insertId,
        username: cleanUsername,
        role: "user"
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
    const [rows] = await pool.query(
      "SELECT id, username, role, password_hash FROM users WHERE username = ? LIMIT 1",
      [cleanUsername]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        message: "Invalid username or password"
      });
    }

    const user = rows[0];
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
      message: "Login success",
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
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
    message: "Profile fetched",
    user: req.user
  });
}

module.exports = {
  register,
  login,
  getProfile
};
