// 导入图鉴样式数据到数据库
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'db', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// 图鉴样式数据
const patternsData = [
  {
    name: '吉祥八宝纹',
    category: '传统纹样',
    region: '西藏自治区',
    material: '羊毛',
    color: '红、黄、蓝、绿、白',
    description: '藏传佛教八种吉祥象征：法轮、法螺、宝伞、白盖、莲花、宝瓶、金鱼、盘长结，寓意吉祥圆满。',
    symbolism: '象征佛教八宝，代表吉祥、圆满、长寿、智慧',
    sort_order: 1
  },
  {
    name: '雪山祥云纹',
    category: '自然纹样',
    region: '拉萨',
    material: '羊毛、丝线',
    color: '白、蓝、红',
    description: '以雪山和祥云为主题，展现青藏高原的壮丽自然风光。',
    symbolism: '象征雪山神圣、祥云吉祥',
    sort_order: 2
  },
  {
    name: '格桑花纹',
    category: '花卉纹样',
    region: '山南地区',
    material: '羊毛',
    color: '粉、白、黄',
    description: '格桑花是西藏的象征之花，代表幸福美好。',
    symbolism: '象征幸福、美好、顽强',
    sort_order: 3
  },
  {
    name: '江孜地毯纹',
    category: '几何纹样',
    region: '日喀则',
    material: '羊毛',
    color: '红、蓝、黄、白',
    description: '江孜地毯传统图案，以几何图形和线条为主，色彩鲜明。',
    symbolism: '象征大地、天空、阳光',
    sort_order: 4
  },
  {
    name: '藏式回纹',
    category: '几何纹样',
    region: '西藏各地',
    material: '羊毛',
    color: '红、蓝',
    description: '传统回纹图案，线条回旋往复，连绵不绝。',
    symbolism: '象征吉祥绵延不断',
    sort_order: 5
  },
  {
    name: '莲花生大师纹',
    category: '宗教纹样',
    region: '西藏各地',
    material: '羊毛、丝线',
    color: '金、红、蓝',
    description: '纪念莲花生大师的宗教图案，具有神圣意义。',
    symbolism: '象征智慧、慈悲、加持',
    sort_order: 6
  },
  {
    name: '牦牛纹',
    category: '动物纹样',
    region: '那曲',
    material: '羊毛',
    color: '黑、白、棕',
    description: '以高原牦牛为主题，展现藏族人民与自然的和谐。',
    symbolism: '象征力量、坚韧、财富',
    sort_order: 7
  },
  {
    name: '六字真言纹',
    category: '宗教纹样',
    region: '西藏各地',
    material: '羊毛、丝线',
    color: '金、红、蓝、白',
    description: '六字大明咒图案，具有深刻的宗教内涵。',
    symbolism: '象征慈悲、智慧、加持',
    sort_order: 8
  },
  {
    name: '雪域彩虹纹',
    category: '色彩纹样',
    region: '西藏各地',
    material: '羊毛',
    color: '红、橙、黄、绿、蓝、紫',
    description: '以彩虹为灵感，展现高原天空的绚丽色彩。',
    symbolism: '象征希望、美好、吉祥',
    sort_order: 9
  },
  {
    name: '藏式龙凤纹',
    category: '传统纹样',
    region: '拉萨',
    material: '丝线',
    color: '金、红、蓝',
    description: '融合汉藏文化的龙凤图案，象征尊贵与吉祥。',
    symbolism: '象征尊贵、吉祥、权力',
    sort_order: 10
  }
];

async function importPatterns() {
  console.log('开始导入图鉴样式数据...');
  
  for (const pattern of patternsData) {
    await new Promise((resolve) => {
      db.get('SELECT id FROM patterns WHERE name = ?', [pattern.name], (err, row) => {
        if (err) {
          console.error('查询失败:', err);
          resolve();
          return;
        }
        
        if (row) {
          // 更新现有记录
          db.run(
            'UPDATE patterns SET category = ?, region = ?, material = ?, color = ?, description = ?, symbolism = ?, sort_order = ? WHERE id = ?',
            [pattern.category, pattern.region, pattern.material, pattern.color, pattern.description, pattern.symbolism, pattern.sort_order, row.id],
            (err) => {
              if (err) {
                console.error(`更新样式 ${pattern.name} 失败:`, err);
              } else {
                console.log(`更新样式: ${pattern.name}`);
              }
              resolve();
            }
          );
        } else {
          // 插入新记录
          db.run(
            'INSERT INTO patterns (name, category, region, material, color, description, symbolism, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [pattern.name, pattern.category, pattern.region, pattern.material, pattern.color, pattern.description, pattern.symbolism, pattern.sort_order],
            (err) => {
              if (err) {
                console.error(`插入样式 ${pattern.name} 失败:`, err);
              } else {
                console.log(`插入样式: ${pattern.name}`);
              }
              resolve();
            }
          );
        }
      });
    });
  }
  
  console.log('\n导入完成！');
  
  // 验证导入结果
  db.all('SELECT id, name, category, region FROM patterns ORDER BY sort_order ASC', (err, rows) => {
    if (err) {
      console.error('验证失败:', err);
    } else {
      console.log('\n当前图鉴样式列表:');
      rows.forEach(row => {
        console.log(`  ${row.id}. ${row.name} - ${row.category} - ${row.region}`);
      });
    }
    db.close();
  });
}

importPatterns().catch(err => {
  console.error('导入过程出错:', err);
  db.close();
});