const { db } = require('../db/sqliteConnection');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/avatars');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片'));
    }
  }
});

function verifyUser(req) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return { valid: false, message: '未登录' };
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bondian_dev_secret');
    return { valid: true, decoded };
  } catch (error) {
    return { valid: false, message: 'token无效' };
  }
}

exports.uploadAvatar = [
  upload.single('avatar'),
  async (req, res) => {
    const auth = verifyUser(req);
    if (!auth.valid) {
      return res.status(403).json({ success: false, message: auth.message });
    }
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: '请选择图片' });
    }
    
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    
    try {
      await new Promise((resolve) => {
        db.run('UPDATE users SET avatar_url = ? WHERE id = ?', [avatarUrl, auth.decoded.id], () => resolve());
      });
      
      res.json({
        success: true,
        message: '头像上传成功',
        data: { avatarUrl }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
];

exports.changePassword = async (req, res) => {
  const auth = verifyUser(req);
  if (!auth.valid) {
    return res.status(403).json({ success: false, message: auth.message });
  }
  
  const { oldPassword, newPassword } = req.body;
  
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ success: false, message: '请输入原密码和新密码' });
  }
  
  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: '新密码至少6位' });
  }
  
  try {
    const user = await new Promise((resolve) => {
      db.get('SELECT password FROM users WHERE id = ?', [auth.decoded.id], (err, row) => {
        if (err) resolve(null);
        else resolve(row);
      });
    });
    
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    
    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      return res.status(400).json({ success: false, message: '原密码错误' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await new Promise((resolve) => {
      db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, auth.decoded.id], () => resolve());
    });
    
    res.json({
      success: true,
      message: '密码修改成功'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyWorks = async (req, res) => {
  const auth = verifyUser(req);
  if (!auth.valid) {
    return res.status(403).json({ success: false, message: auth.message });
  }
  
  try {
    const rows = await new Promise((resolve) => {
      db.all('SELECT * FROM works WHERE author_id = ? ORDER BY createdAt DESC', [auth.decoded.id], (err, rows) => {
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

exports.updateWork = async (req, res) => {
  const auth = verifyUser(req);
  if (!auth.valid) {
    return res.status(403).json({ success: false, message: auth.message });
  }
  
  const workId = req.params.id;
  const { title, description } = req.body;
  
  try {
    const work = await new Promise((resolve) => {
      db.get('SELECT author_id FROM works WHERE id = ?', [workId], (err, row) => {
        if (err) resolve(null);
        else resolve(row);
      });
    });
    
    if (!work) {
      return res.status(404).json({ success: false, message: '作品不存在' });
    }
    
    if (work.author_id !== auth.decoded.id) {
      return res.status(403).json({ success: false, message: '无权限' });
    }
    
    await new Promise((resolve) => {
      db.run('UPDATE works SET title = ?, description = ? WHERE id = ?', [title, description, workId], () => resolve());
    });
    
    res.json({
      success: true,
      message: '作品更新成功'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteWork = async (req, res) => {
  const auth = verifyUser(req);
  if (!auth.valid) {
    return res.status(403).json({ success: false, message: auth.message });
  }
  
  const workId = req.params.id;
  
  try {
    const work = await new Promise((resolve) => {
      db.get('SELECT author_id FROM works WHERE id = ?', [workId], (err, row) => {
        if (err) resolve(null);
        else resolve(row);
      });
    });
    
    if (!work) {
      return res.status(404).json({ success: false, message: '作品不存在' });
    }
    
    if (work.author_id !== auth.decoded.id) {
      return res.status(403).json({ success: false, message: '无权限' });
    }
    
    await new Promise((resolve) => {
      db.run('DELETE FROM works WHERE id = ?', [workId], () => resolve());
    });
    
    res.json({
      success: true,
      message: '作品删除成功'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFavoritePatterns = async (req, res) => {
  const auth = verifyUser(req);
  if (!auth.valid) {
    return res.status(403).json({ success: false, message: auth.message });
  }
  
  try {
    const rows = await new Promise((resolve) => {
      db.all(`
        SELECT p.* FROM patterns p
        INNER JOIN favorite_patterns fp ON p.id = fp.pattern_id
        WHERE fp.user_id = ? ORDER BY fp.createdAt DESC
      `, [auth.decoded.id], (err, rows) => {
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

exports.addFavoritePattern = async (req, res) => {
  const auth = verifyUser(req);
  if (!auth.valid) {
    return res.status(403).json({ success: false, message: auth.message });
  }
  
  const patternId = req.params.id;
  
  try {
    await new Promise((resolve) => {
      db.run('INSERT OR IGNORE INTO favorite_patterns (user_id, pattern_id) VALUES (?, ?)', [auth.decoded.id, patternId], () => resolve());
    });
    
    res.json({
      success: true,
      message: '收藏成功'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeFavoritePattern = async (req, res) => {
  const auth = verifyUser(req);
  if (!auth.valid) {
    return res.status(403).json({ success: false, message: auth.message });
  }
  
  const patternId = req.params.id;
  
  try {
    await new Promise((resolve) => {
      db.run('DELETE FROM favorite_patterns WHERE user_id = ? AND pattern_id = ?', [auth.decoded.id, patternId], () => resolve());
    });
    
    res.json({
      success: true,
      message: '取消收藏成功'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFavoriteDeclarations = async (req, res) => {
  const auth = verifyUser(req);
  if (!auth.valid) {
    return res.status(403).json({ success: false, message: auth.message });
  }
  
  try {
    const rows = await new Promise((resolve) => {
      db.all('SELECT * FROM favorite_declarations WHERE user_id = ? ORDER BY createdAt DESC', [auth.decoded.id], (err, rows) => {
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

exports.addFavoriteDeclaration = async (req, res) => {
  const auth = verifyUser(req);
  if (!auth.valid) {
    return res.status(403).json({ success: false, message: auth.message });
  }
  
  const { content, colors } = req.body;
  
  try {
    const result = await new Promise((resolve) => {
      db.run('INSERT INTO favorite_declarations (user_id, content, colors) VALUES (?, ?, ?)',
        [auth.decoded.id, content, JSON.stringify(colors)], function(err) {
          if (err) resolve({ insertId: null });
          else resolve({ insertId: this.lastID });
        });
    });
    
    res.json({
      success: true,
      message: '宣言收藏成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeFavoriteDeclaration = async (req, res) => {
  const auth = verifyUser(req);
  if (!auth.valid) {
    return res.status(403).json({ success: false, message: auth.message });
  }
  
  const declarationId = req.params.id;
  
  try {
    await new Promise((resolve) => {
      db.run('DELETE FROM favorite_declarations WHERE user_id = ? AND id = ?', [auth.decoded.id, declarationId], () => resolve());
    });
    
    res.json({
      success: true,
      message: '取消收藏成功'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getHistory = async (req, res) => {
  const auth = verifyUser(req);
  if (!auth.valid) {
    return res.status(403).json({ success: false, message: auth.message });
  }
  
  try {
    const rows = await new Promise((resolve) => {
      db.all('SELECT * FROM user_history WHERE user_id = ? ORDER BY createdAt DESC LIMIT 50', [auth.decoded.id], (err, rows) => {
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

exports.addHistory = async (req, res) => {
  const auth = verifyUser(req);
  if (!auth.valid) {
    return res.status(403).json({ success: false, message: auth.message });
  }
  
  const { type, target_id, title, image_url } = req.body;
  
  // 获取当前本地时间
  const now = new Date();
  const localTime = now.toISOString().replace('T', ' ').substring(0, 19);
  
  try {
    await new Promise((resolve) => {
      db.run('INSERT INTO user_history (user_id, type, target_id, title, image_url, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
        [auth.decoded.id, type, target_id, title, image_url, localTime], () => resolve());
    });
    
    res.json({
      success: true,
      message: '浏览记录添加成功'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.clearHistory = async (req, res) => {
  const auth = verifyUser(req);
  if (!auth.valid) {
    return res.status(403).json({ success: false, message: auth.message });
  }
  
  try {
    await new Promise((resolve) => {
      db.run('DELETE FROM user_history WHERE user_id = ?', [auth.decoded.id], () => resolve());
    });
    
    res.json({
      success: true,
      message: '浏览记录清空成功'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};