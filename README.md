# 🎬 影视系统

基于 Bun + Hono 开发的影视管理系统

## 功能特性

- 📺 **影视浏览**
- 热门影视展示
- 按分类浏览
- 影视搜索功能
- 影视详情查看

👤 **用户系统**
- 用户注册/登录
- 用户个人中心
- JWT 身份认证
- 密码加密存储

🔐 **安全防护**
- 速率限制
- 输入过滤
- SQL 注入防护
- XSS 防护

🛠️ **管理后台**
- 管理员控制台
- 影视内容管理（创建/编辑/删除）
- 用户列表查看

## 技术栈

- **运行时**: [Bun](https://bun.sh)
- **Web 框架**: [Hono](https://hono.dev)
- **UI 框架**: Tailwind CSS
- **语言**: TypeScript

## 快速开始

### 安装依赖

```bash
bun install
```

### 启动开发服务器

```bash
bun run dev
```

### 启动生产服务器

```bash
bun start
```

服务器将在 http://localhost:3000 启动

## 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 普通用户 | user | user123 |

## 项目结构

```
/workspace
├── src/
│   ├── index.ts          # 应用入口
│   ├── data/           # 数据模块
│   │   ├── movies.ts  # 影视数据
│   │   ├── types.ts   # 类型定义
│   │   └── users.ts    # 用户数据
│   ├── lib/            # 库函数
│   │   └── auth.ts    # 认证工具
│   ├── middleware/     # 中间件
│   │   ├── auth.ts    # 认证中间件
│   │   └── security.ts # 安全中间件
│   ├── routes/         # 路由模块
│   │   ├── admin.ts   # 管理路由
│   │   ├── auth.ts     # 认证路由
│   │   ├── movies.ts  # 影视路由
│   │   └── users.ts    # 用户路由
│   └── views/          # 视图模块
│       ├── admin.ts    # 管理视图
│       ├── auth.ts      # 认证视图
│       └── templates.ts # 模板视图
├── package.json
├── tsconfig.json
└── bun.lock
```

## 主要路由

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

### 管理路由 (需管理员权限)
- `GET /admin` - 管理控制台
- `GET /admin/movies` - 影视管理
- `GET /admin/movies/create` - 创建影视
- `POST /admin/movies/create` - 创建影视(提交)
- `GET /admin/movies/edit/:id` - 编辑影视
- `POST /admin/movies/update` - 更新影视
- `GET /admin/movies/delete/:id` - 删除影视
- `GET /admin/users` - 用户列表

## 许可证

MIT

## 作者

影视系统团队
