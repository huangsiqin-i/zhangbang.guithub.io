// 导入传承人数据到数据库
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'db', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// 传承人数据（来自 culture.html）
const mastersData = [
  {
    name: '嘎日',
    title: '国家级非物质文化遗产代表性传承人',
    region: '西藏自治区·山南市贡嘎县杰德秀镇',
    birth_year: 1963,
    experience_years: 58,
    avatarUrl: 'images/嘎日.jpg',
    achievements: JSON.stringify(['国家级非物质文化遗产代表性传承人', '第五批国家级非遗项目代表性传承人', '七彩邦典编织技艺大赛参赛']),
    story: `嘎日出生于贡嘎县杰德秀镇一个邦典编织世家，是家中第四代传承人。她的父亲是村里编织邦典的好手，在家庭环境的熏陶下，嘎日12岁起便在父亲的指导下开始系统学习邦典织造技艺。

2002年，嘎日与丈夫格桑共同创立了杰德秀镇格桑围裙农民合作社，初期以家庭作坊方式生产，仅靠12名村民手工编织，年销售额不足10万元。2006年，杰德秀邦典编织技艺被列入国家级非物质文化遗产保护名录，嘎日成为国家级传承人。

2007年，她开办了杰德秀格桑民族羊毛手工加工厂，招收二十余名学徒。2008年3月，同贡嘎县职业中学联合开办培训班，培训九十余人次。2011年丈夫去世后，女儿旦增卓嘎接手合作社事务。如今合作社年销售额达200多万元，产品远销尼泊尔、不丹及欧洲等地。`,
    skills: JSON.stringify(['传统织造技艺', '天然染料染色', '技艺传承', '合作社管理']),
    works: JSON.stringify([
      { name: '传统吉祥纹样邦典', year: '2006年', description: '入选国家级非遗展的经典作品' },
      { name: '核桃皮染色邦典', year: '2014年', description: '使用天然核桃皮染料的创新尝试' },
      { name: '羊绒邦典', year: '2020年', description: '使用羊绒原料，质地更光滑鲜亮' }
    ]),
    quotes: '每一道工序都得精益求精，任何一道工序出了问题，都会影响邦典的质量。织机也会唱歌，唱得动听与否全靠匠人自己调节。',
    sort_order: 1
  },
  {
    name: '格桑',
    title: '第一批国家级非物质文化遗产代表性传承人',
    region: '西藏自治区·山南市贡嘎县',
    birth_year: 1956,
    death_year: 2011,
    experience_years: 30,
    is_deceased: 1,
    avatarUrl: 'images/格桑.jpg',
    achievements: JSON.stringify(['第一批国家级非物质文化遗产项目代表性传承人', '编号01-0140', '创立西藏第一家邦典编织家庭作坊']),
    story: `格桑，1956年出生于西藏贡嘎县，早年师从达娃学会了邦典编织、染色、缝纫等全套技艺。他是藏族邦典、卡垫织造技艺的第三代传承人。

1980年代，格桑成立了西藏第一家邦典编织家庭作坊，拥有毡氇架18架，他编织的围裙工艺细致，并为产品注册了商标，开创了邦典市场化的先河。

2002年，格桑与妻子嘎日共同创立了杰德秀镇格桑围裙农民合作社，最初仅有12名村民参与，年销售额不足10万元。在他们的共同努力下，合作社逐渐发展壮大。2011年格桑去世后，女儿旦增卓嘎接替了传承责任。`,
    skills: JSON.stringify(['邦典编织', '传统染色', '缝纫技艺', '作坊经营']),
    works: JSON.stringify([
      { name: '传统邦典围裙', year: '1980年代', description: '开创西藏邦典家庭作坊先河' },
      { name: '注册商标邦典', year: '1990年代', description: '首个注册品牌的邦典产品' },
      { name: '合作社系列邦典', year: '2000年代', description: '推动邦典规模化生产' }
    ]),
    quotes: '邦典不能只挂在墙上，要穿在人身上，更要走进市场里。',
    sort_order: 2
  },
  {
    name: '旦增卓嘎',
    title: '杰德秀邦典编织技艺市级代表性传承人',
    region: '西藏自治区·山南市贡嘎县',
    birth_year: 1995,
    experience_years: 20,
    avatarUrl: 'images/卓嘎.jpg',
    achievements: JSON.stringify(['全国劳动模范', '全国三八红旗手', '西藏自治区劳动模范', '山南市工艺美术大师']),
    story: `旦增卓嘎，1995年9月出生于贡嘎县杰德秀镇，是家中第五代邦典织造技艺传承人。她的母亲嘎日是国家级非遗传承人，父亲格桑是第三代传承人。

旦增卓嘎12岁开始跟随母亲学习邦典编织技艺。2011年父亲去世后，年仅16岁的她接过了格桑围裙农民合作社的经营重担。为提升技艺与视野，她曾到大学进修，并前往北京、上海、成都、山东等地参加各类编织技艺比赛。

在她的带领下，合作社规模不断扩大，产品远销日本、印度、尼泊尔等10余个国家，年营收突破200万元。她积极探索"文化+设计"的跨界融合，将邦典图案和色彩元素融入抱枕、手机壳、地毯、服饰等现代生活用品中。`,
    skills: JSON.stringify(['邦典编织', '文创设计', '品牌运营', '技艺传承']),
    works: JSON.stringify([
      { name: '巨型邦典', year: '2018年', description: '录入吉尼斯世界纪录的巨型邦典作品' },
      { name: '文创产品系列', year: '2020年', description: '抱枕、手机壳等现代生活用品' },
      { name: '藏式服饰系列', year: '2023年', description: '融入邦典元素的时尚服饰' }
    ]),
    quotes: '保护—创新—传播—消费—再保护，让邦典技艺在现代社会中长久生存。',
    sort_order: 3
  }
];

async function importMasters() {
  console.log('开始导入传承人数据...');
  
  for (const master of mastersData) {
    await new Promise((resolve) => {
      db.get('SELECT id FROM masters WHERE name = ?', [master.name], (err, row) => {
        if (err) {
          console.error('查询失败:', err);
          resolve();
          return;
        }
        
        if (row) {
          // 更新现有记录
          db.run(
            'UPDATE masters SET title = ?, region = ?, birth_year = ?, death_year = ?, experience_years = ?, is_deceased = ?, avatarUrl = ?, achievements = ?, story = ?, skills = ?, works = ?, quotes = ?, sort_order = ? WHERE id = ?',
            [master.title, master.region, master.birth_year, master.death_year, master.experience_years, master.is_deceased || 0, master.avatarUrl, master.achievements, master.story, master.skills, master.works, master.quotes, master.sort_order, row.id],
            (err) => {
              if (err) {
                console.error(`更新传承人 ${master.name} 失败:`, err);
              } else {
                console.log(`更新传承人: ${master.name}`);
              }
              resolve();
            }
          );
        } else {
          // 插入新记录
          db.run(
            'INSERT INTO masters (name, title, region, birth_year, death_year, experience_years, is_deceased, avatarUrl, achievements, story, skills, works, quotes, sort_order, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [master.name, master.title, master.region, master.birth_year, master.death_year, master.experience_years, master.is_deceased || 0, master.avatarUrl, master.achievements, master.story, master.skills, master.works, master.quotes, master.sort_order, 'active'],
            (err) => {
              if (err) {
                console.error(`插入传承人 ${master.name} 失败:`, err);
              } else {
                console.log(`插入传承人: ${master.name}`);
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
  db.all('SELECT id, name, title FROM masters ORDER BY sort_order ASC', (err, rows) => {
    if (err) {
      console.error('验证失败:', err);
    } else {
      console.log('\n当前传承人列表:');
      rows.forEach(row => {
        console.log(`  ${row.id}. ${row.name} - ${row.title}`);
      });
    }
    db.close();
  });
}

importMasters().catch(err => {
  console.error('导入过程出错:', err);
  db.close();
});