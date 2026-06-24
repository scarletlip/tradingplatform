# 校园二手市场 (Campus Second-hand Marketplace)

一个基于 Next.js 的校园二手交易 MVP 应用，完全复刻 UI 设计，所有数据从数据库动态加载。

## 功能特性

- 商品浏览与分类筛选（数据来自数据库）
- 用户登录认证（JWT）
- 商品详情查看
- 卖家联系方式展示
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
export DATABASE_URL="file:./dev.db"
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts

# 3. 启动开发服务器
npm run dev
```

访问 http://localhost:3000

### 演示账号

| 用户名 | 密码 |
|--------|------|
| 张三 | demo123 |
| 李四 | demo123 |
| 王五 | demo123 |

## 项目结构

```
├── prisma/
│   ├── schema.prisma      # 数据库模型
│   └── seed.ts            # 种子数据
├── src/
│   ├── app/               # Next.js 页面和 API 路由
│   ├── components/        # React 组件
│   └── lib/               # 工具函数
├── package.json
└── README.md
```

## API 文档

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/categories` | 获取所有分类 |
| GET | `/api/items` | 获取商品列表（支持 `?category=教材` 过滤） |
| GET | `/api/items/[id]` | 获取单个商品详情 |
| POST | `/api/auth/login` | 用户登录，返回 JWT token |

## 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run start` | 启动生产服务器 |
| `npm run db:generate` | 生成 Prisma 客户端 |
| `npm run db:push` | 将 schema 推送到数据库 |
| `npm run db:seed` | 运行种子数据脚本 |
