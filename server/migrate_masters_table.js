// 迁移 masters 表，添加缺失字段
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'db', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// 检查并添加缺失的字段
const addColumnIfNotExists = (columnName, columnType, defaultValue = '') => {
  return new Promise((resolve) => {
    // SQLite 不支持直接检查列是否存在，所以我们尝试添加并忽略错误
    db.run(`ALTER TABLE masters ADD COLUMN ${columnName} ${columnType} ${defaultValue}`, (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.warn(`添加列 ${columnName} 失败:`, err.message);
      } else {
        console.log(`列 ${columnName} 添加成功或已存在`);
      }
      resolve();
    });
  });
};

async function migrate() {
  console.log('开始迁移 masters 表...');
  
  await addColumnIfNotExists('experience_years', 'INTEGER', 'DEFAULT 0');
  await addColumnIfNotExists('sort_order', 'INTEGER', 'DEFAULT 0');
  await addColumnIfNotExists('birth_year', 'INTEGER', '');
  await addColumnIfNotExists('achievements', 'TEXT', '');
  await addColumnIfNotExists('story', 'TEXT', '');
  await addColumnIfNotExists('quotes', 'TEXT', '');
  await addColumnIfNotExists('skills', 'TEXT', '');
  await addColumnIfNotExists('status', 'TEXT', "DEFAULT 'active'");
  
  console.log('迁移完成！');
  
  // 查看当前表结构
  db.all("PRAGMA table_info(masters)", (err, rows) => {
    if (err) {
      console.error('获取表结构失败:', err);
    } else {
      console.log('\n当前 masters 表结构:');
      rows.forEach(row => {
        console.log(`  ${row.name} ${row.type} ${row.notnull ? 'NOT NULL' : ''} ${row.dflt_value ? `DEFAULT ${row.dflt_value}` : ''}`);
      });
    }
    db.close();
  });
}

migrate().catch(err => {
  console.error('迁移失败:', err);
  db.close();
});