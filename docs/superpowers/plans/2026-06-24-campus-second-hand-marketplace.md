# Campus Second-hand Marketplace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an MVP single-page campus second-hand marketplace SPA with Next.js, Prisma, and SQLite — replicating the provided UI design with zero hardcoded data.

**Architecture:** Next.js App Router with API routes serving as a full-stack monolith. Prisma ORM with SQLite for zero-config local database. Tailwind CSS for styling. JWT-based simulated authentication.

**Tech Stack:** Next.js 14 (App Router), React 18, TypeScript, Prisma, SQLite, Tailwind CSS, bcrypt, jsonwebtoken, next-auth-compatible session pattern.

---

## File Map

| File | Responsibility |
|------|---------------|
| `prisma/schema.prisma` | Database schema definition |
| `prisma/seed.ts` | Seed data for categories, users, items |
| `src/lib/db.ts` | Prisma client singleton |
| `src/lib/auth.ts` | bcrypt + JWT utility functions |
| `src/app/layout.tsx` | Root layout with Navbar |
| `src/app/page.tsx` | Home page (Hero + CategoryFilter + ItemGrid) |
| `src/app/login/page.tsx` | Login page |
| `src/app/api/categories/route.ts` | GET all categories |
| `src/app/api/items/route.ts` | GET items with optional category filter |
| `src/app/api/items/[id]/route.ts` | GET single item by ID |
| `src/app/api/auth/login/route.ts` | POST authenticate user |
| `src/components/Navbar.tsx` | Top navigation bar |
| `src/components/Hero.tsx` | Hero section |
| `src/components/CategoryFilter.tsx` | Category filter tabs |
| `src/components/ItemGrid.tsx` | Product grid container |
| `src/components/ItemCard.tsx` | Individual product card |
| `src/components/ItemDetail.tsx` | Product detail modal |
| `src/components/ui/Button.tsx` | Reusable button component |
| `src/components/ui/Modal.tsx` | Reusable modal wrapper |
| `tailwind.config.ts` | Tailwind configuration |
| `postcss.config.mjs` | PostCSS config |
| `package.json` | Dependencies and scripts |
| `tsconfig.json` | TypeScript config |
| `next.config.mjs` | Next.js config |
| `README.md` | Project documentation |

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.mjs`
- Create: `tailwind.config.ts`
- Create: `postcss.config.mjs`
- Create: `.env.local`
- Create: `src/app/globals.css`

- [ ] **Step 1: Create package.json**

Create `package.json`:

```json
{
  "name": "campus-marketplace",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:seed": "tsx prisma/seed.ts",
    "db:setup": "prisma generate && prisma db push && tsx prisma/seed.ts"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@prisma/client": "^5.18.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "@types/node": "^20.14.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.6",
    "prisma": "^5.18.0",
    "tailwindcss": "^3.4.4",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0",
    "tsx": "^4.16.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create next.config.mjs**

Create `next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
```

- [ ] **Step 4: Create tailwind.config.ts**

Create `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf2',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 5: Create postcss.config.mjs**

Create `postcss.config.mjs`:

```javascript
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
```

- [ ] **Step 6: Create .env.local**

Create `.env.local`:

```
DATABASE_URL="file:./dev.db"
JWT_SECRET="campus-marketplace-jwt-secret-change-in-production"
```

- [ ] **Step 7: Create src/app/globals.css**

Create `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
```

- [ ] **Step 8: Install dependencies**

Run:
```bash
cd "E:\agneswork\trading platform"
npm install
```

Expected: All packages install successfully, no errors.

- [ ] **Step 9: Commit**

```bash
git init 2>/dev/null || true
git add package.json tsconfig.json next.config.mjs tailwind.config.ts postcss.config.mjs .env.local src/app/globals.css
git commit -m "chore: scaffold project with Next.js, Tailwind, and dependencies" 2>/dev/null || echo "Git not initialized, files created"
```

---

## Task 2: Database Setup

**Files:**
- Create: `prisma/schema.prisma`
- Create: `prisma/seed.ts`
- Create: `src/lib/db.ts`
- Create: `src/lib/auth.ts`

- [ ] **Step 1: Create prisma/schema.prisma**

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

enum UserRole {
  USER
  ADMIN
}

enum ItemStatus {
  ACTIVE
  SOLD
  OFFLINE
}

model Category {
  id         Int      @id @default(autoincrement())
  name       String   @unique
  icon       String?
  sortOrder  Int      @default(0)
  items      Item[]

  @@map("categories")
}

model User {
  id        Int         @id @default(autoincrement())
  username  String      @unique
  password  String
  avatar    String?
  contact   String?
  role      UserRole    @default(USER)
  createdAt DateTime    @default(now())
  items     Item[]
  favorites Favorite[]

  @@map("users")
}

model Item {
  id          Int        @id @default(autoincrement())
  title       String
  description String?
  price       Float
  category    String
  images      String?    // JSON array of image URLs
  sellerId    Int
  status      ItemStatus @default(ACTIVE)
  createdAt   DateTime   @default(now())
  seller      User       @relation(fields: [sellerId], references: [id], onDelete: Cascade)
  favorites   Favorite[]

  @@map("items")
}

model Favorite {
  id        Int      @id @default(autoincrement())
  userId    Int
  itemId    Int
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  item      Item     @relation(fields: [itemId], references: [id], onDelete: Cascade)

  @@unique([userId, itemId])
  @@map("favorites")
}
```

- [ ] **Step 2: Create prisma/seed.ts**

Create `prisma/seed.ts`:

```typescript
import { PrismaClient, UserRole, ItemStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Hash a default password for demo users (password: "demo123")
  const hashedPassword = await bcrypt.hash('demo123', 10);

  // Clear existing data
  await prisma.favorite.deleteMany();
  await prisma.item.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: '全部', sortOrder: 0 } }),
    prisma.category.create({ data: { name: '教材', sortOrder: 1 } }),
    prisma.category.create({ data: { name: '电子产品', sortOrder: 2 } }),
    prisma.category.create({ data: { name: '生活用品', sortOrder: 3 } }),
    prisma.category.create({ data: { name: '美妆', sortOrder: 4 } }),
  ]);

  // Create demo users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        username: '张三',
        password: hashedPassword,
        avatar: '',
        contact: 'zhangsan@campus.edu',
      },
    }),
    prisma.user.create({
      data: {
        username: '李四',
        password: hashedPassword,
        avatar: '',
        contact: 'lisi@campus.edu',
      },
    }),
    prisma.user.create({
      data: {
        username: '王五',
        password: hashedPassword,
        avatar: '',
        contact: 'wangwu@campus.edu',
      },
    }),
  ]);

  // Create demo items
  const items = [
    // 教材
    {
      title: '高等数学（第七版）',
      description: '同济大学编，九成新，无笔记无划线',
      price: 35,
      category: '教材',
      images: JSON.stringify(['https://picsum.photos/400/300?random=1']),
      sellerId: users[0].id,
      status: ItemStatus.ACTIVE,
    },
    {
      title: '线性代数辅导讲义',
      description: '李永乐编，全新未拆封',
      price: 25,
      category: '教材',
      images: JSON.stringify(['https://picsum.photos/400/300?random=2']),
      sellerId: users[1].id,
      status: ItemStatus.ACTIVE,
    },
    {
      title: '大学英语精读第三册',
      description: '使用过一学期，状况良好',
      price: 15,
      category: '教材',
      images: JSON.stringify(['https://picsum.photos/400/300?random=3']),
      sellerId: users[2].id,
      status: ItemStatus.ACTIVE,
    },
    // 电子产品
    {
      title: 'iPad Air 4 64GB 灰色',
      description: '2021年购入，电池健康度95%，附赠保护壳和笔',
      price: 2800,
      category: '电子产品',
      images: JSON.stringify(['https://picsum.photos/400/300?random=4']),
      sellerId: users[0].id,
      status: ItemStatus.ACTIVE,
    },
    {
      title: '机械键盘 Cherry MX 红轴',
      description: 'Cherry MX Board 3.0S，自用半年，因升级换轴出售',
      price: 350,
      category: '电子产品',
      images: JSON.stringify(['https://picsum.photos/400/300?random=5']),
      sellerId: users[1].id,
      status: ItemStatus.ACTIVE,
    },
    {
      title: '索尼 WH-1000XM4 耳机',
      description: '黑色，降噪效果极佳，配件齐全',
      price: 1200,
      category: '电子产品',
      images: JSON.stringify(['https://picsum.photos/400/300?random=6']),
      sellerId: users[2].id,
      status: ItemStatus.ACTIVE,
    },
    // 生活用品
    {
      title: '小米台灯 Pro',
      description: '使用两个月，光线柔和不伤眼',
      price: 80,
      category: '生活用品',
      images: JSON.stringify(['https://picsum.photos/400/300?random=7']),
      sellerId: users[0].id,
      status: ItemStatus.ACTIVE,
    },
    {
      title: '宿舍小冰箱 50L',
      description: '制冷效果好，搬家带不走，自取优先',
      price: 200,
      category: '生活用品',
      images: JSON.stringify(['https://picsum.photos/400/300?random=8']),
      sellerId: users[1].id,
      status: ItemStatus.ACTIVE,
    },
    // 美妆
    {
      title: '兰蔻小黑瓶精华 100ml',
      description: '专柜购入，剩余约70%，因过敏转卖',
      price: 450,
      category: '美妆',
      images: JSON.stringify(['https://picsum.photos/400/300?random=9']),
      sellerId: users[2].id,
      status: ItemStatus.ACTIVE,
    },
    {
      title: '完美日记口红套装',
      description: '三支装，色号：红丝绒、枫叶色、奶茶色',
      price: 120,
      category: '美妆',
      images: JSON.stringify(['https://picsum.photos/400/300?random=10']),
      sellerId: users[0].id,
      status: ItemStatus.ACTIVE,
    },
  ];

  for (const item of items) {
    await prisma.item.create({ data: item });
  }

  console.log(`Seeded: ${categories.length} categories, ${users.length} users, ${items.length} items`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

- [ ] **Step 3: Create src/lib/db.ts**

Create `src/lib/db.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
```

- [ ] **Step 4: Create src/lib/auth.ts**

Create `src/lib/auth.ts`:

```typescript
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'campus-marketplace-jwt-secret-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface JwtPayload {
  userId: number;
  username: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}
```

- [ ] **Step 5: Generate Prisma client and push schema**

Run:
```bash
cd "E:\agneswork\trading platform"
npx prisma generate
npx prisma db push
```

Expected: Prisma Client generated successfully, schema pushed to SQLite database.

- [ ] **Step 6: Run seed script**

Run:
```bash
cd "E:\agneswork\trading platform"
npx tsx prisma/seed.ts
```

Expected output: `Seeded: 5 categories, 3 users, 10 items`

- [ ] **Step 7: Commit**

```bash
git add prisma/ src/lib/
git commit -m "feat: add database schema, seed data, and auth utilities" 2>/dev/null || echo "Git not initialized"
```

---

## Task 3: API Routes

**Files:**
- Create: `src/app/api/categories/route.ts`
- Create: `src/app/api/items/route.ts`
- Create: `src/app/api/items/[id]/route.ts`
- Create: `src/app/api/auth/login/route.ts`

- [ ] **Step 1: Create GET /api/categories**

Create `src/app/api/categories/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        icon: true,
        sortOrder: true,
      },
    });
    return NextResponse.json(categories);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create GET /api/items**

Create `src/app/api/items/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const where: Record<string, unknown> = { status: 'ACTIVE' };
    if (category && category !== '全部') {
      where.category = category;
    }

    const items = await prisma.item.findMany({
      where,
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            avatar: true,
            contact: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}
```

- [ ] **Step 3: Create GET /api/items/[id]**

Create `src/app/api/items/[id]/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid item ID' }, { status: 400 });
    }

    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            avatar: true,
            contact: true,
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch item' }, { status: 500 });
  }
}
```

- [ ] **Step 4: Create POST /api/auth/login**

Create `src/app/api/auth/login/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = generateToken({
      userId: user.id,
      username: user.username,
    });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        contact: user.contact,
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/
git commit -m "feat: add API routes for categories, items, and auth" 2>/dev/null || echo "Git not initialized"
```

---

## Task 4: UI Components

**Files:**
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Modal.tsx`
- Create: `src/components/Navbar.tsx`
- Create: `src/components/Hero.tsx`
- Create: `src/components/CategoryFilter.tsx`
- Create: `src/components/ItemCard.tsx`
- Create: `src/components/ItemGrid.tsx`
- Create: `src/components/ItemDetail.tsx`

- [ ] **Step 1: Create Button component**

Create `src/components/ui/Button.tsx`:

```typescript
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500';

  const variantClasses = {
    primary: 'bg-primary-500 hover:bg-primary-600 text-white',
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 2: Create Modal component**

Create `src/components/ui/Modal.tsx`:

```typescript
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="关闭"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create Navbar component**

Create `src/components/Navbar.tsx`:

```typescript
import Link from 'next/link';

interface NavbarProps {
  isLoggedIn: boolean;
  username?: string;
  onLoginClick: () => void;
  onLogout: () => void;
}

export function Navbar({ isLoggedIn, username, onLoginClick, onLogout }: NavbarProps) {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-primary-500 text-2xl font-bold">校园二手市场</span>
          </Link>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <span className="text-gray-700 text-sm">欢迎, {username}</span>
                <button
                  onClick={onLogout}
                  className="text-primary-500 hover:text-primary-600 text-sm font-medium transition-colors"
                >
                  退出登录
                </button>
              </>
            ) : (
              <button
                onClick={onLoginClick}
                className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                登录
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 4: Create Hero component**

Create `src/components/Hero.tsx`:

```typescript
export function Hero() {
  return (
    <section className="bg-gradient-to-br from-primary-500 to-primary-600 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">校园二手市场</h1>
        <p className="text-lg sm:text-xl text-primary-100">
          发现校园内的闲置好物
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Create CategoryFilter component**

Create `src/components/CategoryFilter.tsx`:

```typescript
interface CategoryFilterProps {
  categories: { id: number; name: string; icon?: string | null; sortOrder: number }[];
  selectedCategory: string;
  onSelect: (category: string) => void;
}

export function CategoryFilter({ categories, selectedCategory, onSelect }: CategoryFilterProps) {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.name)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.name
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create ItemCard component**

Create `src/components/ItemCard.tsx`:

```typescript
interface Seller {
  id: number;
  username: string;
  avatar: string | null;
  contact: string | null;
}

interface ItemCardProps {
  item: {
    id: number;
    title: string;
    description: string | null;
    price: number;
    category: string;
    images: string | null;
    status: string;
    seller: Seller;
  };
  onClick: (id: number) => void;
}

export function ItemCard({ item, onClick }: ItemCardProps) {
  const imageUrl = item.images ? JSON.parse(item.images)[0] : '';

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
      onClick={() => onClick(item.id)}
    >
      <div className="aspect-square bg-gray-100 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-gray-900 font-medium truncate mb-1">{item.title}</h3>
        <p className="text-primary-600 font-bold text-lg">¥{item.price}</p>
        <div className="flex items-center gap-2 mt-2">
          {item.seller.avatar ? (
            <img src={item.seller.avatar} alt="" className="w-5 h-5 rounded-full" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-gray-200" />
          )}
          <span className="text-xs text-gray-500 truncate">{item.seller.username}</span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Create ItemGrid component**

Create `src/components/ItemGrid.tsx`:

```typescript
import { ItemCard } from './ItemCard';

interface Seller {
  id: number;
  username: string;
  avatar: string | null;
  contact: string | null;
}

interface Item {
  id: number;
  title: string;
  description: string | null;
  price: number;
  category: string;
  images: string | null;
  status: string;
  seller: Seller;
}

interface ItemGridProps {
  items: Item[];
  onItemSelect: (id: number) => void;
}

export function ItemGrid({ items, onItemSelect }: ItemGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="text-lg font-medium">暂无物品</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} onClick={onItemSelect} />
      ))}
    </div>
  );
}
```

- [ ] **Step 8: Create ItemDetail component**

Create `src/components/ItemDetail.tsx`:

```typescript
interface Seller {
  id: number;
  username: string;
  avatar: string | null;
  contact: string | null;
}

interface ItemDetailProps {
  item: {
    id: number;
    title: string;
    description: string | null;
    price: number;
    category: string;
    images: string | null;
    status: string;
    createdAt: string;
    seller: Seller;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ItemDetail({ item, isOpen, onClose }: ItemDetailProps) {
  if (!item) return null;

  const images = item.images ? JSON.parse(item.images) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">商品详情</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="关闭"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {images.length > 0 && (
            <img
              src={images[0]}
              alt={item.title}
              className="w-full aspect-square object-cover rounded-lg"
            />
          )}

          <div>
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
              <span className="text-2xl font-bold text-primary-600">¥{item.price}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">分类: {item.category}</p>
          </div>

          {item.description && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">描述</h4>
              <p className="text-gray-600 text-sm">{item.description}</p>
            </div>
          )}

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">卖家信息</h4>
            <div className="flex items-center gap-3">
              {item.seller.avatar ? (
                <img src={item.seller.avatar} alt="" className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                  {item.seller.username.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">{item.seller.username}</p>
                {item.seller.contact && (
                  <p className="text-sm text-gray-500">{item.seller.contact}</p>
                )}
              </div>
            </div>
            <button className="mt-3 w-full bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg text-sm font-medium transition-colors">
              联系卖家
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 9: Commit**

```bash
git add src/components/
git commit -m "feat: add all UI components matching the design" 2>/dev/null || echo "Git not initialized"
```

---

## Task 5: Pages Integration

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`
- Create: `src/app/login/page.tsx`

- [ ] **Step 1: Create root layout with Navbar**

Modify `src/app/layout.tsx`:

```typescript
import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { useState, useEffect } from 'react';

export const metadata: Metadata = {
  title: '校园二手市场',
  description: '发现校园内的闲置好物',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setIsLoggedIn(true);
          setUsername(user.username);
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    }
  }, []);

  const handleLoginClick = () => {
    window.location.href = '/login';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUsername('');
  };

  return (
    <html lang="zh-CN">
      <body className="bg-gray-50 min-h-screen">
        <Navbar
          isLoggedIn={isLoggedIn}
          username={username}
          onLoginClick={handleLoginClick}
          onLogout={handleLogout}
        />
        <main>{children}</main>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Create home page**

Modify `src/app/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Hero } from '@/components/Hero';
import { CategoryFilter } from '@/components/CategoryFilter';
import { ItemGrid } from '@/components/ItemGrid';
import { ItemDetail } from '@/components/ItemDetail';

interface Category {
  id: number;
  name: string;
  icon: string | null;
  sortOrder: number;
}

interface Seller {
  id: number;
  username: string;
  avatar: string | null;
  contact: string | null;
}

interface Item {
  id: number;
  title: string;
  description: string | null;
  price: number;
  category: string;
  images: string | null;
  status: string;
  createdAt: string;
  seller: Seller;
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [detailItem, setDetailItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => setCategories([{ id: 0, name: '全部', icon: null, sortOrder: 0 }]));
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/items${selectedCategory === '全部' ? '' : `?category=${encodeURIComponent(selectedCategory)}`}`);
        const data = await res.json();
        setItems(data);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [selectedCategory]);

  const handleItemSelect = async (id: number) => {
    try {
      const res = await fetch(`/api/items/${id}`);
      const data = await res.json();
      setDetailItem(data);
      setSelectedItemId(id);
    } catch {
      console.error('Failed to fetch item detail');
    }
  };

  return (
    <div>
      <Hero />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
        />
        <div className="mt-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
            </div>
          ) : (
            <ItemGrid items={items} onItemSelect={handleItemSelect} />
          )}
        </div>
      </div>
      <ItemDetail
        item={detailItem}
        isOpen={selectedItemId !== null}
        onClose={() => {
          setSelectedItemId(null);
          setDetailItem(null);
        }}
      />
    </div>
  );
}
```

- [ ] **Step 3: Create login page**

Create `src/app/login/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '登录失败');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/');
      router.refresh();
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">登录</h1>
        <p className="text-gray-500 text-sm mb-6">
          演示账号: 张三 / 李四 / 王五, 密码: demo123
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              用户名
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
              placeholder="请输入用户名"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              密码
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
              placeholder="请输入密码"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white py-2.5 rounded-lg font-medium transition-colors"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx src/app/page.tsx src/app/login/
git commit -m "feat: integrate pages with data fetching and login flow" 2>/dev/null || echo "Git not initialized"
```

---

## Task 6: Documentation

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create README.md**

Create `README.md`:

```markdown
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
npm run db:setup

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

## 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run start` | 启动生产服务器 |
| `npm run db:setup` | 生成 Prisma 客户端 + 推送 schema + 填充数据 |
| `npm run db:generate` | 生成 Prisma 客户端 |
| `npm run db:push` | 将 schema 推送到数据库 |
| `npm run db:seed` | 运行种子数据脚本 |
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README with setup instructions and API docs" 2>/dev/null || echo "Git not initialized"
```

---

## Task 7: Verification

**Files:**
- Verify all routes work
- Verify database loads correctly
- Verify UI matches design

- [ ] **Step 1: Start dev server and verify**

Run:
```bash
cd "E:\agneswork\trading platform"
npm run dev
```

Expected: Server starts on http://localhost:3000, no compilation errors.

Verify:
1. Homepage loads with hero section and green gradient
2. Category filter tabs show all 5 categories
3. Item grid displays 10 products in responsive grid
4. Clicking a category filters items correctly
5. Clicking a product card opens detail modal with full info
6. Clicking "登录" navigates to login page
7. Login with "张三" / "demo123" succeeds and shows username in navbar
8. Clicking "退出登录" logs out
9. Empty state shows "暂无物品" when category has no items (test with filtering)
10. Responsive layout works on different screen sizes

- [ ] **Step 2: Final commit**

```bash
git add -A
git commit -m "chore: final verification and cleanup" 2>/dev/null || echo "Git not initialized"
```

---

## Summary

| Task | Files | Description |
|------|-------|-------------|
| 1 | 7 files | Project scaffolding (Next.js + Tailwind) |
| 2 | 4 files | Database schema, seed, Prisma setup |
| 3 | 4 files | API routes (categories, items, auth) |
| 4 | 8 files | UI components (Navbar, Hero, filters, cards, modal) |
| 5 | 3 files | Page integration (home, login, layout state) |
| 6 | 1 file | README documentation |
| 7 | N/A | Verification and final commit |

Total: ~27 files created, ~7 tasks.
