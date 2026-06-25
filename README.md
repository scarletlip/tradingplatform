# 校园二手市场 (Campus Second-hand Marketplace)

一个基于 Next.js 的校园二手交易平台，所有数据从数据库动态加载。

## 功能特性

- 商品浏览与分类筛选（8个分类：教材/数码/生活/穿搭/运动/乐器/其他）
- 学号+密码登录（JWT 认证，默认密码 123456）
- 商品详情查看（含卖家信息：姓名/学号/宿舍/手机号/邮箱）
- 商品发布（含图片拖拽上传、成色标注）
- 商品搜索
- 收藏功能
- 个人中心（我的发布/我的收藏）
- 商品管理（编辑/下架/标记已售/删除）
- 响应式布局（手机/平板/桌面）

## 技术栈

- **前端**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: SQLite + Prisma ORM
- **认证**: JWT (jsonwebtoken) + bcrypt

## 本地启动

### 前置要求

- Node.js 18+
- npm 或 yarn

### 安装步骤

```bash
# 1. 安装依赖
npm install

# 2. 初始化数据库并填充种子数据
npm run db:setup

# 3. 启动开发服务器
npm run dev
```

访问 http://localhost:3000

### 演示账号

使用学号登录，默认密码: `123456`

示例学号: `2021770487`, `2021246316`, `2021542417` 等（共50个用户）

## 项目结构

```
├── prisma/
│   ├── schema.prisma      # 数据库模型
│   └── seed.ts            # 种子数据（50用户 + 350商品）
├── src/
│   ├── app/               # Next.js 页面和 API 路由
│   ├── components/        # React 组件
│   ├── contexts/          # React Context
│   └── lib/               # 工具函数
├── package.json
└── README.md
```

## API 文档

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/categories` | 获取所有分类 |
| GET | `/api/items` | 获取商品列表（支持 `?category=` 和 `?search=`） |
| GET | `/api/items/[id]` | 获取单个商品详情 |
| POST | `/api/items` | 创建新商品（需登录） |
| PATCH | `/api/items/[id]` | 更新商品（仅卖家） |
| DELETE | `/api/items/[id]` | 删除商品（仅卖家） |
| POST | `/api/auth/login` | 学号密码登录，返回 JWT token |
| GET | `/api/favorites` | 获取收藏列表（需登录） |
| POST | `/api/favorites` | 添加收藏（需登录） |
| POST | `/api/favorites/[itemId]` | 取消收藏（需登录） |

## 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run start` | 启动生产服务器 |
| `npm run db:generate` | 生成 Prisma 客户端 |
| `npm run db:push` | 将 schema 推送到数据库 |
| `npm run db:seed` | 运行种子数据脚本 |
| `npm run db:setup` | 一键初始化（generate + push + seed） |
