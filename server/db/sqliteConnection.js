const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath, { verbose: console.log });

// 创建兼容层，支持旧版 sqlite3 的异步 API
const dbAsync = {
  all: (sql, params = [], callback) => {
    try {
      const stmt = db.prepare(sql);
      const rows = params.length > 0 ? stmt.all(...params) : stmt.all();
      callback(null, rows);
    } catch (err) {
      callback(err, []);
    }
  },
  
  get: (sql, params = [], callback) => {
    try {
      const stmt = db.prepare(sql);
      const row = params.length > 0 ? stmt.get(...params) : stmt.get();
      callback(null, row);
    } catch (err) {
      callback(err, null);
    }
  },
  
  run: (sql, params = [], callback) => {
    try {
      const stmt = db.prepare(sql);
      const result = params.length > 0 ? stmt.run(...params) : stmt.run();
      // 兼容旧版 sqlite3 的 this.lastID
      const wrappedResult = {
        lastID: result.lastInsertRowid || 0,
        changes: result.changes || 0
      };
      if (callback) {
        callback(null, wrappedResult);
      }
    } catch (err) {
      if (callback) {
        callback(err);
      }
    }
  },
  
  prepare: (sql) => {
    const stmt = db.prepare(sql);
    return {
      run: (...params) => stmt.run(...params),
      get: (...params) => stmt.get(...params),
      all: (...params) => stmt.all(...params),
      bind: () => {}
    };
  },
  
  exec: (sql) => {
    db.exec(sql);
  }
};

// 保存原始的 better-sqlite3 对象
dbAsync.original = db;

const initDatabase = async () => {
  try {
    const createTables = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT,
        role TEXT DEFAULT 'user',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS bondians (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT,
        region TEXT,
        description TEXT,
        imageUrl TEXT,
        colors TEXT,
        patterns TEXT,
        origin TEXT,
        culturalSignificance TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bondianId INTEGER,
        userId INTEGER,
        content TEXT,
        parentId INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        bondianId INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(userId, bondianId)
      );
      
      CREATE TABLE IF NOT EXISTS masters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        title TEXT,
        avatarUrl TEXT,
        bio TEXT,
        works TEXT,
        region TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS patterns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT,
        description TEXT,
        imageUrl TEXT,
        symbolism TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS announcements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS adminLogs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT,
        target TEXT,
        operator TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS works (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        author_id INTEGER,
        status TEXT DEFAULT 'approved',
        colors TEXT,
        stripeWidth INTEGER DEFAULT 30,
        imagePath TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        description TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT,
        description TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS banners (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        image_url TEXT,
        link TEXT,
        title TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS favorite_patterns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        pattern_id INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, pattern_id)
      );
      
      CREATE TABLE IF NOT EXISTS favorite_declarations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        content TEXT,
        colors TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS user_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        type TEXT,
        target_id INTEGER,
        title TEXT,
        image_url TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    db.exec(createTables);
    console.log('✅ Database tables created successfully');
    insertInitialData();
  } catch (err) {
    console.error('❌ Failed to create tables:', err.message);
    throw err;
  }
};

const insertInitialData = () => {
  const adminPasswordHash = '$2b$10$/jyWhSR0rICfAjMl8FM0lOqlIl/bVW71C.2yjaRqdP3HNv1L3vNnW';
  
  const insertUser = db.prepare(`INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)`);
  insertUser.run('admin', adminPasswordHash, 'admin');
  insertUser.run('123', adminPasswordHash, 'user');
  
  const insertBondian = db.prepare(`INSERT OR IGNORE INTO bondians (name, type, region, description, imageUrl) VALUES (?, ?, ?, ?, ?)`);
  insertBondian.run('传统邦典', '经典款', '西藏', '传统藏族邦典，手工织造，色彩鲜艳', 'images/1.jpg');
  insertBondian.run('现代邦典', '创新款', '青海', '结合现代设计的邦典作品', 'images/2.jpg');
  insertBondian.run('格桑花邦典', '图案款', '四川', '以格桑花为主题的精美邦典', 'images/3.jpg');
  
  console.log('✅ Initial data inserted');
};

const testConnection = async () => {
  try {
    const result = db.prepare('SELECT 1').get();
    console.log('✅ Database connection test passed');
    return true;
  } catch (err) {
    console.error('❌ Database connection test failed:', err.message);
    return false;
  }
};

module.exports = { db: dbAsync, initDatabase, testConnection };