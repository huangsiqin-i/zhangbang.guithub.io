const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'db/database.sqlite');
const db = new sqlite3.Database(dbPath);

// 正确的密码哈希值（密码是 123456）
const correctHash = '$2b$10$/jyWhSR0rICfAjMl8FM0lOqlIl/bVW71C.2yjaRqdP3HNv1L3vNnW';

console.log('开始更新用户密码...');
console.log('目标哈希:', correctHash);

db.run('UPDATE users SET password = ? WHERE username = ?', [correctHash, 'admin'], function(err) {
  if (err) {
    console.error('更新admin失败:', err.message);
    db.close();
    return;
  }
  console.log('admin 更新成功，影响行数:', this.changes);
  
  db.run('UPDATE users SET password = ? WHERE username = ?', [correctHash, '123'], function(err) {
    if (err) {
      console.error('更新123失败:', err.message);
    } else {
      console.log('123 更新成功，影响行数:', this.changes);
    }
    
    // 验证更新结果
    db.get('SELECT password FROM users WHERE username = ?', ['admin'], (err, row) => {
      if (err) {
        console.error('验证失败:', err.message);
      } else {
        console.log('数据库中存储的哈希:', row.password);
        console.log('哈希匹配:', row.password === correctHash);
      }
      db.close();
    });
  });
});