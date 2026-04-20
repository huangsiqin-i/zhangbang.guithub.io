# 邦典文化传承平台

## 项目简介

邦典文化传承平台是一个致力于保护和传承西藏藏族传统服饰文化——邦典（围裙）的综合性Web应用。平台通过数字化手段，将邦典的分类体系、地域特色、文化内涵等内容进行系统整理和展示，为用户提供一个了解、学习和交流邦典文化的在线平台。

## 技术栈

### 前端技术
- **框架**: HTML5 + CSS3 + JavaScript (ES6+)
- **CSS框架**: Tailwind CSS 3
- **图标库**: Lucide Icons
- **响应式设计**: 移动端优先

### 后端技术
- **框架**: Node.js + Express.js
- **数据库**: MySQL 8.0+
- **认证**: JWT + bcryptjs
- **跨域**: CORS

## 功能特性

### 用户端功能
- 🔍 **邦典浏览**: 按分类、地域浏览邦典信息
- 🖼️ **图片展示**: 大图查看、多图展示
- ❤️ **收藏功能**: 收藏喜欢的邦典
- 💬 **评论互动**: 用户评论和回复
- 🔐 **用户认证**: 注册、登录、个人中心

### 管理端功能
- 📊 **数据统计**: 邦典、用户、评论统计
- ✅ **审核管理**: 邦典和评论审核
- 📝 **内容管理**: 邦典信息管理

## 快速开始

### 环境要求
- Node.js >= 18.0.0
- MySQL >= 8.0.0

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd bondian-platform
```

2. **安装依赖**
```bash
cd server
npm install
```

3. **配置数据库**
- 创建数据库 `bondian_platform`
- 导入数据库结构: `server/db/schema.sql`
- 更新配置文件: `server/.env`

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=bondian_platform
JWT_SECRET=your_jwt_secret
```

4. **启动服务**
```bash
cd server
npm start
```

5. **访问应用**
- 前端: 直接打开 `index.html` 文件或使用静态服务器
- 后端API: http://localhost:3000

## 项目结构

```
bondian-platform/
├── images/                    # 图片资源
│   ├── 1.jpg, 2.jpg...        # 邦典相关图片
│   └── 西藏自治区地图政区简图版A1.jpg
├── server/                    # 后端代码
│   ├── controllers/           # 控制器
│   │   ├── adminLogsController.js
│   │   ├── announcementsController.js
│   │   ├── authController.js
│   │   ├── bondianController.js
│   │   ├── commentController.js
│   │   ├── favoriteController.js
│   │   ├── healthController.js
│   │   ├── linksController.js
│   │   ├── mastersController.js
│   │   ├── patternsController.js
│   │   ├── settingsController.js
│   │   ├── statsController.js
│   │   ├── userController.js
│   │   └── worksController.js
│   ├── routes/                # 路由
│   ├── db/                    # 数据库配置
│   ├── middlewares/           # 中间件
│   ├── uploads/avatars/       # 头像上传目录
│   ├── app.js                 # 应用入口
│   ├── package.json           # 依赖配置
│   └── .env.example          # 环境变量示例
├── index.html                 # 首页
├── life-journey.html          # 人生旅程/分类浏览页
├── culture.html               # 文化介绍页
├── design.html                # 设计展示页
├── designer.html              # 设计师页
├── gallery.html               # 图库页
├── patterns.html              # 图案页
├── map.html                   # 地图页
├── gam.html                   # 游戏/互动页
├── admin.html                 # 管理后台
├── user-center.html           # 用户中心
├── api.js                     # API接口封装
├── lang.js                    # 语言配置
├── .gitignore                 # Git忽略配置
└── README.md                  # 项目文档
```

## 测试用户

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | 123456 |
| 普通用户 | user1 | 123456 |

## 文化价值

邦典是藏族女性不可或缺的服饰，承载着丰富的文化内涵：
- **历史传承**: 千年织造技艺的延续
- **地域特色**: 不同地区的邦典各具特色
- **文化符号**: 色彩和纹样蕴含深刻寓意
- **非遗保护**: 数字化传承的重要意义

## 许可证

MIT License

## 联系方式

如有问题或建议，请联系开发团队。