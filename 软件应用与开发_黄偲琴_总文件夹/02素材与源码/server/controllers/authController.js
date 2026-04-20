const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const defaultUsersData = [
  { username: "admin", password_hash: "$2b$10$1nPk0Ir/jWHx9HjFvJl5p.inH93Bcv.GTpjOz3xRqFeUzWySbVewm", role: "admin", id: 1 },
  { username: "123", password_hash: "$2b$10$1nPk0Ir/jWHx9HjFvJl5p.inH93Bcv.GTpjOz3xRqFeUzWySbVewm", role: "user", id: 2 }
];

let users = [...defaultUsersData];
let nextUserId = 3;

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
    const existingUser = users.find(u => u.username === cleanUsername);
    
    if (existingUser) {
      return res.status(409).json({
        message: "Username already exists"
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = {
      id: nextUserId++,
      username: cleanUsername,
      password_hash: passwordHash,
      role: "user"
    };
    
    users.push(newUser);

    return res.status(201).json({
      success: true,
      message: "Register success",
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role
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
    const user = users.find(u => u.username === cleanUsername);

    if (!user) {
      return res.status(401).json({
        message: "Invalid username or password"
      });
    }

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
    success: true,
    message: "Profile fetched",
    user: req.user
  });
}

async function updateProfile(req, res) {
  const { username, phone, bio } = req.body;
  
  try {
    const user = users.find(u => u.id === req.user.id);
    if (user) {
      user.username = username || user.username;
      user.phone = phone;
      user.bio = bio;
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated",
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        phone: user.phone,
        bio: user.bio
      }
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
