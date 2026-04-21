// 迁移 patterns 表，添加缺失字段
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'db', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// 添加缺失字段
const addColumnIfNotExists = (columnName, columnType, defaultValue = '') => {
  return new Promise((resolve) => {
    db.run(`ALTER TABLE patterns ADD COLUMN ${columnName} ${columnType} ${defaultValue}`, (err) => {
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
  console.log('开始迁移 patterns 表...');
  
  await addColumnIfNotExists('region', 'TEXT', '');
  await addColumnIfNotExists('material', 'TEXT', '');
  await addColumnIfNotExists('color', 'TEXT', '');
  await addColumnIfNotExists('sort_order', 'INTEGER', 'DEFAULT 0');
  
  console.log('迁移完成！');
  
  // 查看当前表结构
  db.all("PRAGMA table_info(patterns)", (err, rows) => {
    if (err) {
      console.error('获取表结构失败:', err);
    } else {
      console.log('\n当前 patterns 表结构:');
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