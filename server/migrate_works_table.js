// 迁移 works 表结构
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'db/database.sqlite');
const db = new sqlite3.Database(dbPath);

// 检查字段是否存在
const checkColumnExists = (columnName) => {
  return new Promise((resolve) => {
    db.all("PRAGMA table_info(works)", (err, rows) => {
      if (err) {
        resolve(false);
      } else {
        const exists = rows.some(row => row.name === columnName);
        resolve(exists);
      }
    });
  });
};

// 迁移表结构
const migrate = async () => {
  console.log('开始迁移 works 表结构...');
  
  // 检查现有字段
  const hasAuthorId = await checkColumnExists('author_id');
  const hasStatus = await checkColumnExists('status');
  const hasColors = await checkColumnExists('colors');
  const hasStripeWidth = await checkColumnExists('stripeWidth');
  const hasImagePath = await checkColumnExists('imagePath');
  
  // 如果缺少必要字段，需要重建表
  if (!hasAuthorId || !hasStatus || !hasColors || !hasStripeWidth) {
    console.log('需要重建 works 表...');
    
    db.serialize(() => {
      // 创建临时表
      db.run(`CREATE TABLE IF NOT EXISTS works_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        author_id INTEGER,
        status TEXT DEFAULT 'approved',
        colors TEXT,
        stripeWidth INTEGER DEFAULT 30,
        imagePath TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) {
          console.error('创建新表失败:', err.message);
          db.close();
          return;
        }
        console.log('✓ 创建新表 works_new');
        
        // 复制数据
        db.run(`INSERT INTO works_new (id, title, description, createdAt)
          SELECT id, title, description, createdAt FROM works`, (err) => {
          if (err) {
            console.error('复制数据失败:', err.message);
          } else {
            console.log('✓ 复制数据完成');
          }
          
          // 删除旧表
          db.run(`DROP TABLE works`, (err) => {
            if (err) {
              console.error('删除旧表失败:', err.message);
              db.close();
              return;
            }
            console.log('✓ 删除旧表');
            
            // 重命名新表
            db.run(`ALTER TABLE works_new RENAME TO works`, (err) => {
              if (err) {
                console.error('重命名表失败:', err.message);
              } else {
                console.log('✓ 重命名表完成');
              }
              
              // 验证表结构
              db.all("PRAGMA table_info(works)", (err, rows) => {
                if (err) {
                  console.error('获取表结构失败:', err.message);
                } else {
                  console.log('\nworks 表当前结构:');
                  rows.forEach(row => {
                    console.log(`  ${row.name} (${row.type}) ${row.notnull ? 'NOT NULL' : ''} ${row.dflt_value ? 'DEFAULT ' + row.dflt_value : ''}`);
                  });
                }
                db.close();
                console.log('\n✓ 迁移完成');
              });
            });
          });
        });
      });
    });
  } else {
    console.log('表结构已经正确，无需迁移');
    db.close();
  }
};

migrate();