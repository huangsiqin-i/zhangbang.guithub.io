# 邦典文化传承平台

> 守护藏族传统服饰文化，传承千年织造技艺

## 项目简介

邦典文化传承平台是一个致力于保护和传承西藏藏族传统服饰文化——**邦典（藏族围裙）** 的综合性Web应用。平台通过数字化手段，系统整理和展示邦典的分类体系、地域特色、文化内涵等内容，为用户提供一个了解、学习和交流邦典文化的在线平台。

### 文化意义

邦典是藏族女性不可或缺的传统服饰，承载着丰富的文化内涵：
- **历史传承**: 千年织造技艺的延续
- **地域特色**: 不同地区的邦典各具特色
- **文化符号**: 色彩和纹样蕴含深刻寓意
- **非遗保护**: 数字化传承的重要意义

---

## 技术栈

### 前端技术
| 分类 | 技术 | 版本 |
|------|------|------|
| 框架 | HTML5 + CSS3 + JavaScript | ES6+ |
| CSS框架 | Tailwind CSS | 3.x |
| 图标库 | Lucide Icons | - |
| 设计理念 | 移动端优先响应式设计 | - |

### 后端技术
| 分类 | 技术 | 版本 |
|------|------|------|
| 语言 | Node.js | >= 18.0.0 |
| 框架 | Express.js | 5.x |
| 数据库 | MySQL | >= 8.0.0 |
| 认证 | JWT + bcryptjs | - |
| 文件上传 | multer | - |
| 跨域 | CORS | - |

---

## 功能特性

### 👤 用户端功能
| 功能 | 描述 | 状态 |
|------|------|------|
| 邦典浏览 | 按分类、地域浏览邦典信息 | ✅ |
| 图片展示 | 大图查看、多图画廊展示 | ✅ |
| 收藏功能 | 收藏喜欢的邦典作品 | ✅ |
| 评论互动 | 用户评论和回复功能 | ✅ |
| 用户认证 | 注册、登录、个人中心 | ✅ |
| 文化展示 | 邦典文化介绍与故事 | ✅ |
| 地图展示 | 地域分布可视化 | ✅ |
| 图案浏览 | 邦典图案分类展示 | ✅ |

### 🔧 管理端功能
| 功能 | 描述 | 状态 |
|------|------|------|
| 数据统计 | 邦典、用户、评论统计概览 | ✅ |
| 审核管理 | 邦典和评论审核 | ✅ |
| 内容管理 | 邦典信息增删改查 | ✅ |
| 用户管理 | 用户信息管理 | ✅ |
| 公告管理 | 系统公告发布 | ✅ |
| 日志记录 | 管理员操作日志 | ✅ |

---

## 快速开始

### 环境要求
- **Node.js**: >= 18.0.0
- **MySQL**: >= 8.0.0
- **npm**: >= 9.0.0

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
- 创建数据库：`bondian_platform`
- 导入数据库结构：`server/db/schema.sql`
- 复制并配置环境变量：

```bash
cd server
cp .env.example .env
```

编辑 `.env` 文件：
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=bondian_platform
JWT_SECRET=your_jwt_secret_key_here
```

4. **启动服务**
```bash
# 开发模式（自动重载）
npm run dev

# 生产模式
npm start
```

5. **访问应用**
- 首页: http://localhost:3000/index.html
- 管理后台: http://localhost:3000/admin.html
- API文档: http://localhost:3000/api/health

---

## 项目结构

```
bondian-platform/
├── images/                     # 图片资源库
│   ├── 1.jpg ~ 100.jpg         # 邦典展示图片
│   ├── 人生1.png ~ 人生5.jpg   # 人生旅程系列图片
│   ├── 卓嘎.jpg, 嘎日.jpg      # 传承人图片
│   ├── 西藏自治区地图政区简图版A1.jpg
│   └── 其他素材图片...
├── server/                     # 后端服务
│   ├── controllers/            # 业务控制器
│   │   ├── authController.js   # 用户认证
│   │   ├── bondianController.js # 邦典管理
│   │   ├── commentController.js # 评论管理
│   │   ├── favoriteController.js # 收藏管理
│   │   ├── mastersController.js # 传承人管理
│   │   ├── patternsController.js # 图案管理
│   │   ├── statsController.js  # 统计数据
│   │   ├── userController.js   # 用户管理
│   │   └── ...
│   ├── routes/                 # API路由
│   ├── db/                     # 数据库配置
│   │   ├── connection.js       # 数据库连接
│   │   └── schema.sql          # 数据库结构
│   ├── middlewares/            # 中间件
│   │   └── authMiddleware.js   # 认证中间件
│   ├── uploads/avatars/        # 用户头像上传目录
│   ├── app.js                  # 应用入口
│   ├── package.json            # 依赖配置
│   └── .env.example            # 环境变量示例
├── index.html                  # 首页
├── life-journey.html           # 人生旅程/分类浏览页
├── culture.html                # 文化介绍页
├── design.html                 # 设计展示页
├── designer.html               # 设计师/传承人页
├── gallery.html                # 图库页
├── patterns.html               # 图案页
├── map.html                    # 地域分布图页
├── gam.html                    # 互动游戏页
├── admin.html                  # 管理后台
├── user-center.html            # 用户中心
├── api.js                      # API接口封装
├── lang.js                     # 语言配置
└── .gitignore                  # Git忽略配置
```

---

## API接口

### 核心接口列表

| 模块 | 接口 | 方法 | 说明 |
|------|------|------|------|
| 健康检查 | `/api/health` | GET | 服务状态检测 |
| 用户认证 | `/api/auth/login` | POST | 用户登录 |
| 用户认证 | `/api/auth/register` | POST | 用户注册 |
| 邦典管理 | `/api/bondians` | GET | 获取邦典列表 |
| 邦典管理 | `/api/bondians/:id` | GET | 获取单个邦典 |
| 评论管理 | `/api/comments` | GET/POST | 评论列表/新增 |
| 收藏管理 | `/api/favorites` | GET/POST/DELETE | 收藏操作 |
| 统计数据 | `/api/stats` | GET | 数据统计 |

---

## 测试用户

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | 123456 |
| 普通用户 | 123 | 123456 |

---

## 开发说明

### 启动开发服务器
```bash
cd server
npm run dev
```

### 代码规范
- 前端：使用ES6+语法，遵循Airbnb JavaScript规范
- 后端：使用Express最佳实践，代码注释清晰
- 数据库：使用参数化查询，防止SQL注入

### 部署建议
- 前端：使用Nginx静态托管
- 后端：使用PM2进程管理
- 数据库：使用MySQL 8.0+，开启主从复制

---

## 许可证

MIT License

---

## 联系方式

如有问题或建议，请联系开发团队。

---

*项目致力于传承和弘扬藏族优秀传统文化，感谢您的关注与支持！*
