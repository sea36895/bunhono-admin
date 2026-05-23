# 🎬 影视系统

基于 Bun + Hono 开发的完整影视管理系统，支持用户认证、影视浏览和内容管理。

## ✨ 功能特性

### 👤 用户系统
- 用户注册与登录
- 个人中心
- JWT 身份认证
- 密码加密存储（SHA-256 + Salt）
- 角色权限管理（管理员/普通用户）

### 📺 影视浏览
- 热门影视展示
- 分类浏览
- 影视搜索（支持标题、描述、导演、演员）
- 影视详情页
- 响应式设计

### 🛡️ 安全防护
- 速率限制（防止暴力破解）
- 输入数据验证与清理
- XSS 防护
- 安全响应头
- SQL 注入防护

### 🎛️ 管理后台
- 仪表盘（统计数据）
- 影视内容管理（创建/编辑/删除）
- 用户列表查看

## 🛠️ 技术栈

- **运行时**: [Bun](https://bun.sh) - 快速的 JavaScript 运行时
- **Web 框架**: [Hono](https://hono.dev) - 轻量级、高性能的 Web 框架
- **UI 样式**: Tailwind CSS - 现代化的 CSS 框架
- **开发语言**: TypeScript - 类型安全的 JavaScript 超集

## 🚀 快速开始

### 前置要求

- Bun 1.0 或更高版本

### 安装与运行

1. **安装依赖**
```bash
bun install
```

2. **启动开发服务器**
```bash
bun run dev
```

3. **启动生产服务器**
```bash
bun start
```

服务器将在 `http://localhost:3000` 启动

### 环境变量配置

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cp .env.example .env
```

主要配置项：
- `PORT`: 服务器端口（默认：3000）
- `JWT_SECRET`: JWT 签名密钥（生产环境必须修改）
- `NODE_ENV`: 运行环境（development/production）

## 👤 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 普通用户 | user | user123 |

## 📂 项目结构

```
/workspace
├── src/
│   ├── index.ts              # 应用入口
│   ├── data/                 # 数据模块
│   │   ├── types.ts          # TypeScript 类型定义
│   │   ├── movies.ts         # 影视数据
│   │   └── users.ts          # 用户数据与认证
│   ├── lib/                  # 工具库
│   │   ├── auth.ts           # 认证工具（JWT）
│   │   └── utils.ts          # 通用工具函数
│   ├── middleware/           # 中间件
│   │   ├── auth.ts           # 认证中间件
│   │   └── security.ts       # 安全中间件
│   ├── routes/               # 路由模块
│   │   ├── admin.ts          # 管理后台路由
│   │   ├── auth.ts           # 认证路由
│   │   ├── movies.ts         # 影视路由
│   │   └── users.ts          # 用户路由
│   └── views/                # 视图模块
│       ├── admin.ts          # 管理后台视图
│       ├── auth.ts           # 认证视图
│       └── templates.ts      # 页面模板
├── .env.example              # 环境变量示例
├── .gitignore               # Git 忽略文件
├── package.json             # 项目配置
├── tsconfig.json            # TypeScript 配置
└── README.md                # 项目文档
```

## 📝 主要路由

### 公开路由
- `GET /` - 首页
- `GET /movie/:id` - 影视详情
- `GET /search` - 搜索影视
- `GET /category/:genre` - 分类浏览
- `GET /login` - 登录页面
- `GET /register` - 注册页面

### 认证路由
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/auth/logout` - 用户登出
- `GET /profile` - 用户个人中心

### 管理后台路由（需管理员权限）
- `GET /admin` - 管理控制台
- `GET /admin/movies` - 影视列表
- `GET /admin/movies/create` - 创建影视页面
- `POST /admin/movies/create` - 创建影视
- `GET /admin/movies/edit/:id` - 编辑影视页面
- `POST /admin/movies/update` - 更新影视
- `GET /admin/movies/delete/:id` - 删除影视
- `GET /admin/users` - 用户列表

## 🔧 可用脚本

```bash
bun run dev      # 启动开发服务器（监听文件变化）
bun start        # 启动生产服务器
bun run build    # 构建项目
bun run clean    # 清理构建文件
```

## 📝 开发说明

### 添加新影视
在 `src/data/movies.ts` 中添加新的影视数据，或通过管理后台创建。

### 用户认证
系统使用 JWT 进行身份认证，令牌存储在 HttpOnly 的 Cookie 中，有效期 7 天。

### 安全特性
- 所有用户输入经过 sanitizeInput 清理
- 速率限制：每分钟最多 100 次请求
- 使用 secureHeaders 中间件设置安全头

## 🔒 安全建议

1. **生产环境**：务必修改 `JWT_SECRET` 为强密码
2. **HTTPS**：生产环境使用 HTTPS 协议
3. **密码**：修改默认账号密码
4. **数据持久化**：考虑添加数据库支持

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系方式

如有问题或建议，欢迎反馈。
