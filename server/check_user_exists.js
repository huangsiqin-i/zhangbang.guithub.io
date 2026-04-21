const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'db', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// 检查特定用户是否存在
const usernameToCheck = 'testuser756690';

console.log(`检查用户 "${usernameToCheck}" 是否存在...`);

db.all("SELECT id, username, password FROM users WHERE username LIKE '%testuser%'", (err, rows) => {
  if (err) {
    console.error('查询失败:', err);
    db.close();
    return;
  }
  
  console.log(`找到 ${rows.length} 个匹配的用户:`);
  rows.forEach(user => {
    console.log(`  ID: ${user.id}, 用户名: ${user.username}, 密码长度: ${user.password ? user.password.length : 0}`);
  });
  
  // 检查最新插入的用户
  db.get("SELECT * FROM users ORDER BY id DESC LIMIT 1", (err, row) => {
    if (err) {
      console.error('查询失败:', err);
    } else {
      console.log('\n最新用户:');
      console.log(row);
    }
    db.close();
  });
});