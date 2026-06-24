# Campus Second-hand Marketplace - Design Document

**Date:** 2026-06-24
**Status:** Approved
**Tech Stack:** Next.js 14 + Prisma + PostgreSQL

---

## 1. Project Overview

Build an MVP single-page application (SPA) for a campus second-hand marketplace, replicating the provided UI design. All data is dynamically loaded from a database — zero hardcoded data in the frontend.

### Core Features
- Top navigation bar with logo and login button
- Hero section with title and subtitle
- Category filter tabs (dynamically loaded from DB)
- Product grid with cards (dynamically loaded from DB)
- Login flow with JWT authentication
- Product detail modal
- Empty state display

### Out of Scope (MVP)
- Product publishing
- Image upload
- Search functionality
- Favorites (optional, included in DB design but not implemented in MVP)

---

## 2. Database Schema

### categories
| Field | Type | Notes |
|-------|------|-------|
| id | Int (auto) | Primary key |
| name | String | Category name (e.g., "教材", "电子产品") |
| icon | String? | Optional icon identifier |
| sort_order | Int | Display order, default 0 |

### users
| Field | Type | Notes |
|-------|------|-------|
| id | Int (auto) | Primary key |
| username | String (unique) | Login name |
| password | String | bcrypt hashed |
| avatar | String? | Profile image URL |
| contact | String? | Contact info (e.g., WeChat) |
| created_at | DateTime | Auto-set on creation |

### items
| Field | Type | Notes |
|-------|------|-------|
| id | Int (auto) | Primary key |
| title | String | Product title |
| description | String? | Product description |
| price | Float | Price in RMB |
| category | String | References categories.name |
| images | String? | JSON array of image URLs |
| seller_id | Int | FK to users.id |
| status | String | "active" / "sold" / "offline" |
| created_at | DateTime | Auto-set on creation |

### favorites (table exists, not implemented in MVP)
| Field | Type | Notes |
|-------|------|-------|
| id | Int (auto) | Primary key |
| user_id | Int | FK to users.id |
| item_id | Int | FK to items.id |
| created_at | DateTime | Auto-set on creation |

---

## 3. Project Structure

```
campus-marketplace/
├── prisma/
│   ├── schema.prisa            # Database schema
│   └── seed.ts                 # Seed data script
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with Navbar
│   │   ├── page.tsx            # Home page
│   │   ├── login/page.tsx      # Login page
│   │   ├── api/items/route.ts  # GET /api/items
│   │   ├── api/items/[id]/route.ts  # GET /api/items/:id
│   │   ├── api/categories/route.ts # GET /api/categories
│   │   └── api/auth/login/route.ts # POST /api/auth/login
│   ├── components/
│   │   ├── Navbar.tsx          # Top navigation bar
│   │   ├── Hero.tsx            # Main title section
│   │   ├── CategoryFilter.tsx  # Category tabs
│   │   ├── ItemGrid.tsx        # Product grid container
│   │   ├── ItemCard.tsx        # Individual product card
│   │   └── ItemDetail.tsx      # Detail modal
│   └── lib/
│       ├── db.ts               # Prisma client singleton
│       └── auth.ts             # JWT utilities + bcrypt helpers
├── package.json
├── tsconfig.json
└── README.md
```

---

## 4. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List all categories ordered by sort_order |
| GET | `/api/items` | List all active items, supports `?category=` filter |
| GET | `/api/items/[id]` | Get single item detail |
| POST | `/api/auth/login` | Authenticate user, return JWT token |

---

## 5. Data Flow

```
Page Load
  └─> fetch('/api/categories') ──> render CategoryFilter
  └─> fetch('/api/items') ──────> render ItemGrid
        └─> fetch(`/api/items?category=${selected}`) on filter click

Login Flow
  └─> User enters credentials
  └─> POST /api/auth/login
  └─> Server verifies with bcrypt
  └─> Server returns JWT
  └─> Store JWT in localStorage
  └─> Update Navbar state

Product Detail
  └─> Click ItemCard
  └─> Show ItemDetail modal
  └─> Display full info + seller contact
```

---

## 6. Error Handling

- Database connection failure: show user-friendly error message
- No items found: display "暂无物品" empty state
- Invalid login credentials: show error toast
- API request failure: show retry option

---

## 7. Styling Approach

- Tailwind CSS for utility-first styling
- Green color scheme matching the UI reference (#22c55e primary)
- CSS Grid for product layout
- Responsive breakpoints for mobile/tablet/desktop

---

## 8. Seed Data

The `seed.ts` script will populate:
- 5 categories (全部, 教材, 电子产品, 生活用品, 美妆)
- 5 demo users
- 10+ sample products across categories
- All prices, descriptions, and statuses realistic for a campus marketplace
