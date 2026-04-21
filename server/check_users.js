const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'db', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// 查看用户表结构
db.all("PRAGMA table_info(users)", (err, rows) => {
  if (err) {
    console.error('获取表结构失败:', err);
    db.close();
    return;
  }
  
  console.log('用户表结构:');
  rows.forEach(row => {
    console.log(`  ${row.name} ${row.type} ${row.notnull ? 'NOT NULL' : ''}`);
  });
  
  // 查看所有用户
  db.all("SELECT id, username, password, LENGTH(password) as password_length FROM users", (err, users) => {
    if (err) {
      console.error('获取用户失败:', err);
      db.close();
      return;
    }
    
    console.log('\n用户列表:');
    users.forEach(user => {
      console.log(`  ID: ${user.id}, 用户名: ${user.username}, 密码长度: ${user.password_length}`);
      if (user.password && user.password.length > 0) {
        console.log(`    密码前20字符: ${user.password.substring(0, 20)}...`);
      }
    });
    
    db.close();
  });
});