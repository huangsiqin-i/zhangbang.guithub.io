const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ SQLite database connection error:', err.message);
  } else {
    console.log('✅ SQLite database connected successfully');
  }
});

const initDatabase = async () => {
  return new Promise((resolve, reject) => {
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
    
    db.exec(createTables, (err) => {
      if (err) {
        console.error('❌ Failed to create tables:', err.message);
        reject(err);
      } else {
        console.log('✅ Database tables created successfully');
        insertInitialData();
        resolve();
      }
    });
  });
};

const insertInitialData = () => {
  const adminPasswordHash = '$2b$10$/jyWhSR0rICfAjMl8FM0lOqlIl/bVW71C.2yjaRqdP3HNv1L3vNnW';
  db.run(`INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)`, ['admin', adminPasswordHash, 'admin']);
  db.run(`INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)`, ['123', adminPasswordHash, 'user']);
  
  db.run(`INSERT OR IGNORE INTO bondians (name, type, region, description, imageUrl) VALUES 
    ('传统邦典', '经典款', '西藏', '传统藏族邦典，手工织造，色彩鲜艳', 'images/1.jpg'),
    ('现代邦典', '创新款', '青海', '结合现代设计的邦典作品', 'images/2.jpg'),
    ('格桑花邦典', '图案款', '四川', '以格桑花为主题的精美邦典', 'images/3.jpg')`);
  
  console.log('✅ Initial data inserted');
};

const testConnection = async () => {
  return new Promise((resolve) => {
    db.get('SELECT 1', (err) => {
      if (err) {
        console.error('❌ Database connection test failed:', err.message);
        resolve(false);
      } else {
        console.log('✅ Database connection test passed');
        resolve(true);
      }
    });
  });
};

module.exports = { db, initDatabase, testConnection };