# 🎯 TwistList - Secure Task Management System

> A production-ready, enterprise-grade task management application built with modern security practices and scalable architecture.

**Live Demo:** [https://twist-list.vercel.app](https://twist-list.vercel.app)

**Assessment Submission for:** TwistDigital Technical Evaluation

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Security Features](#security-features)
- [Key Features](#key-features)
- [Setup & Installation](#setup--installation)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Testing](#testing)

---

## 🎯 Overview

TwistList is a secure, full-stack task management application demonstrating enterprise-level development practices. Built as part of the TwistDigital technical assessment, it showcases:

- **Security-first approach** with multiple layers of protection
- **Modern architecture** using Next.js 14 and NestJS with Fastify
- **Production deployment** on Railway (Backend) and Vercel (Frontend)
- **Type-safe development** with TypeScript across the entire stack
- **Comprehensive CRUD operations** with IDOR protection

### 🏆 Assessment Criteria Coverage

| Category | Implementation | Score Target |
|----------|---------------|--------------|
| **Security** | JWT Auth, Argon2, Rate Limiting, CORS, Helmet, Input Validation | 20% |
| **Code Quality** | TypeScript, Modular Architecture, Design Patterns, Clean Code | 30% |
| **Brainstorm & Soft Skills** | Documented in PLAN.md, Clear commits, Problem-solving | 20% |
| **UI/UX** | Responsive Design, Framer Motion, Command Palette, Optimistic UI | 20% |
| **Deployment** | Railway + Vercel, Docker, CI/CD, Environment Management | 10% |

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS + shadcn/ui
- **State Management:** TanStack Query (React Query) v5
- **Forms:** React Hook Form + Zod validation
- **Animations:** Framer Motion
- **HTTP Client:** Axios with interceptors

### Backend
- **Framework:** NestJS with Fastify adapter
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT + Passport
- **Password Hashing:** Argon2
- **Validation:** Class-validator + Class-transformer
- **Security:** Helmet, CORS, Rate Limiting (@nestjs/throttler)

### DevOps & Deployment
- **Frontend Hosting:** Vercel
- **Backend Hosting:** Railway
- **Database:** Railway PostgreSQL
- **Containerization:** Docker + Docker Compose
- **Version Control:** Git with conventional commits

---

## 🏗️ Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  Next.js 14 (Vercel) - https://twist-list.vercel.app           │
│  - Server Components + Client Components                         │
│  - Vercel Proxy: /api/* → Railway Backend                       │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTPS + Cookies (HttpOnly, Secure)
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                           │
│  NestJS + Fastify (Railway) - https://twistlist.railway.app    │
│  - JWT Authentication & Authorization                            │
│  - Rate Limiting (Throttler)                                     │
│  - CORS Configuration                                            │
│  - Input Validation & Sanitization                               │
└──────────────────────┬──────────────────────────────────────────┘
                       │ Prisma ORM (Type-safe queries)
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer                                  │
│  PostgreSQL (Railway)                                            │
│  - User, Task, Project, Team tables                              │
│  - Foreign key constraints                                       │
│  - Indexed queries                                               │
└─────────────────────────────────────────────────────────────────┘
```

### Deployment Architecture

**Frontend (Vercel):**
- Static site generation for public pages
- Server-side rendering for authenticated routes
- API proxy to avoid CORS issues
- Automatic deployments on `git push`

**Backend (Railway):**
- Dockerized NestJS application
- PostgreSQL database (managed by Railway)
- Automatic migrations on deploy
- Environment-based configuration

---

## 🔐 Security Features

### 1. Authentication & Authorization

**JWT-based Authentication:**
- Access tokens stored in **HttpOnly cookies** (prevents XSS attacks)
- `sameSite: 'none'` with `secure: true` for cross-origin (Vercel ↔ Railway)
- 15-minute token expiration
- Automatic token extraction from cookies or Authorization header

**Password Security:**
- Argon2 hashing (OWASP recommended, GPU-resistant)
- Password complexity requirements enforced client and server-side
- No plaintext passwords in logs or responses

**Example Implementation:**
```typescript
// server/src/auth/auth.service.ts
const hash = await argon.hash(dto.password);
const user = await this.prisma.user.create({ data: { password: hash } });
```

### 2. IDOR (Insecure Direct Object Reference) Protection

Every endpoint verifies ownership before allowing modifications:

```typescript
// Example: User can only delete their own tasks
async deleteTask(taskId: number, userId: number) {
  const task = await this.prisma.task.findUnique({ where: { id: taskId } });
  if (task.userId !== userId) {
    throw new ForbiddenException('You cannot delete this task');
  }
  return this.prisma.task.delete({ where: { id: taskId } });
}
```

### 3. Input Validation

**Backend (NestJS):**
- `ValidationPipe` with `whitelist: true` (strips unknown properties)
- `forbidNonWhitelisted: true` (throws error on extra fields)
- DTO classes with decorators: `@IsEmail()`, `@MinLength()`, `@IsEnum()`

**Frontend (Next.js):**
- Zod schemas for all forms
- React Hook Form integration
- Real-time validation feedback

### 4. Rate Limiting

Protects against brute-force attacks:
- **Login:** 5 requests per minute per IP
- **Registration:** 3 requests per minute per IP
- **Global:** 100 requests per 15 minutes

```typescript
@Throttle({ default: { limit: 5, ttl: 60000 } })
@Post('signin')
async signin(@Body() dto: SignInDto) { ... }
```

### 5. Infrastructure Security

**HTTP Headers (Helmet):**
- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security (HSTS)

**CORS Configuration:**
- Whitelist of allowed origins
- Credentials enabled for cookie transmission
- Dynamic origin validation

**Trust Proxy:**
- Configured for Railway reverse proxy
- Ensures correct HTTPS detection for secure cookies

### 6. XSS & CSRF Protection

- **XSS:** All user content escaped by React by default
- **CSRF:** SameSite cookies + origin validation
- **SQL Injection:** Prisma ORM with parameterized queries

---

## ✨ Key Features

### 1. Authentication System
- User registration with validation
- Secure login with JWT tokens
- Protected routes with automatic redirection
- Logout with cookie cleanup

### 2. Task Management
- **CRUD operations:** Create, Read, Update, Delete tasks
- **Task properties:**
  - Title, description
  - Status: `PENDING`, `IN_PROGRESS`, `DONE`
  - Priority: `LOW`, `MEDIUM`, `HIGH`
  - Due dates
- **Ownership validation:** Users can only modify their own tasks
- **Optimistic UI updates:** Instant feedback before API response

### 3. Advanced UI/UX
- **Responsive Design:** Mobile-first approach, works on all devices
- **Bento Grid Layout:** Modern masonry card layout (not a basic table)
- **Command Palette:** Global search with `Cmd+K` / `Ctrl+K`
- **Animations:** Smooth transitions with Framer Motion
- **Loading States:** Skeleton loaders (never blank screens)
- **Toast Notifications:** Real-time feedback for all actions

### 4. Team Collaboration
- Team creation and management
- Member invitations
- Project organization
- Gantt chart visualization (projects)

### 5. User Profile
- Avatar upload
- Profile editing
- Password change
- Account settings

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+ (LTS recommended)
- pnpm 8+ (or npm/yarn)
- PostgreSQL 14+
- Git

### Local Development Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/Zayan-Mohamed/TwistList.git
cd TwistList
```

#### 2. Backend Setup

```bash
cd server

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Edit .env and set your values:
# - DATABASE_URL (PostgreSQL connection string)
# - JWT_SECRET (generate with: openssl rand -base64 32)
# - COOKIE_SECRET (generate with: openssl rand -base64 32)

# Run database migrations
pnpm prisma migrate dev

# Seed database (optional)
pnpm prisma db seed

# Start development server
pnpm run start:dev

# Server runs at: http://localhost:3000
# Swagger API docs: http://localhost:3000/api
```

#### 3. Frontend Setup

```bash
cd ../client

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Edit .env:
# BACKEND_URL=http://localhost:3000

# Start development server
pnpm run dev

# Frontend runs at: http://localhost:3001
```

#### 4. Access the Application

Open [http://localhost:3001](http://localhost:3001) in your browser.

**Test Credentials (if seeded):**
- Email: `test@example.com`
- Password: `password123`

---

## 🌐 Deployment

### Architecture Overview

**Production URLs:**
- **Frontend:** https://twist-list.vercel.app
- **Backend:** https://twistlist-production.up.railway.app
- **Database:** Railway PostgreSQL (managed)

### Backend Deployment (Railway)

#### Option 1: Railway CLI

```bash
cd server

# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Add PostgreSQL database
railway add postgresql

# Deploy
railway up
```

#### Option 2: GitHub Integration

1. Connect your GitHub repository to Railway
2. Select the `server` folder as the root
3. Railway will auto-detect Dockerfile and deploy
4. Add environment variables in Railway dashboard:
   - `NODE_ENV=production`
   - `JWT_SECRET=<your-secret>`
   - `COOKIE_SECRET=<your-secret>`
   - `CORS_ORIGIN=https://twist-list.vercel.app`
   - `DATABASE_URL` (auto-provided by Railway)

#### Verification

```bash
# Check if backend is running
curl https://twistlist-production.up.railway.app/health
```

### Frontend Deployment (Vercel)

#### Option 1: Vercel CLI

```bash
cd client

# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

#### Option 2: GitHub Integration (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Select `client` folder as root directory
4. **IMPORTANT:** Do NOT set `NEXT_PUBLIC_API_URL` environment variable
5. Edit `vercel.json` and update the proxy destination to your Railway URL:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://YOUR-RAILWAY-APP.railway.app/:path*"
    }
  ]
}
```

6. Deploy!

**Why use Vercel proxy?**
- Cookies work properly (same-origin)
- No CORS issues
- Better performance
- See [VERCEL_PROXY_FIX.md](VERCEL_PROXY_FIX.md) for details

#### Post-Deployment Verification

1. Visit https://twist-list.vercel.app
2. Open DevTools → Network tab
3. Try to login
4. Verify API requests go to `/api/*` (NOT directly to Railway)
5. Check cookies are set under `twist-list.vercel.app` domain

---

## 📚 API Documentation

### Swagger UI

Once the backend is running, access interactive API documentation:
- **Local:** http://localhost:3000/api
- **Production:** https://twistlist-production.up.railway.app/api

### Core Endpoints

#### Authentication

```
POST   /auth/signup      # Register new user
POST   /auth/signin      # Login (returns JWT in httpOnly cookie)
POST   /auth/logout      # Logout (clears cookie)
```

#### Tasks

```
GET    /tasks            # List all user's tasks
GET    /tasks/:id        # Get specific task
POST   /tasks            # Create new task
PATCH  /tasks/:id        # Update task
DELETE /tasks/:id        # Delete task
POST   /tasks/reorder    # Reorder tasks (bulk update positions)
```

#### Users

```
GET    /users/profile    # Get current user profile
PATCH  /users/profile    # Update profile
```

#### Projects

```
GET    /projects         # List user's projects
POST   /projects         # Create project
GET    /projects/:id     # Get project details
PATCH  /projects/:id     # Update project
DELETE /projects/:id     # Delete project
```

#### Teams

```
GET    /teams            # List user's teams
POST   /teams            # Create team
GET    /teams/:id        # Get team details
PATCH  /teams/:id        # Update team
POST   /teams/:id/members # Add team member
```

### Request/Response Examples

**Create Task:**
```bash
curl -X POST https://twist-list.vercel.app/api/tasks \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=<your-jwt>" \
  -d '{
    "title": "Complete README",
    "description": "Write comprehensive documentation",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "dueDate": "2026-02-20T00:00:00Z"
  }'
```

**Response:**
```json
{
  "id": 1,
  "title": "Complete README",
  "description": "Write comprehensive documentation",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "dueDate": "2026-02-20T00:00:00.000Z",
  "userId": 1,
  "projectId": null,
  "position": 0,
  "createdAt": "2026-02-18T10:00:00.000Z",
  "updatedAt": "2026-02-18T10:00:00.000Z"
}
```

---

## 📁 Project Structure

```
TwistList/
├── client/                    # Frontend (Next.js)
│   ├── src/
│   │   ├── app/              # App Router pages
│   │   │   ├── dashboard/    # Dashboard page
│   │   │   ├── login/        # Login page
│   │   │   ├── register/     # Registration page
│   │   │   ├── tasks/        # Task management
│   │   │   ├── projects/     # Project management
│   │   │   └── teams/        # Team collaboration
│   │   ├── components/       # Reusable UI components
│   │   │   ├── ui/           # shadcn/ui components
│   │   │   ├── dashboard/    # Dashboard-specific
│   │   │   └── *.tsx         # Feature components
│   │   ├── lib/              # Utilities
│   │   │   ├── api.ts        # API client (Axios)
│   │   │   ├── hooks.ts      # React Query hooks
│   │   │   └── utils.ts      # Helper functions
│   │   └── types/            # TypeScript types
│   ├── public/               # Static assets
│   ├── vercel.json           # Vercel configuration
│   ├── next.config.ts        # Next.js configuration
│   └── package.json
│
├── server/                    # Backend (NestJS)
│   ├── src/
│   │   ├── auth/             # Authentication module
│   │   │   ├── strategy/     # Passport strategies
│   │   │   ├── guard/        # Auth guards
│   │   │   └── dto/          # Data transfer objects
│   │   ├── tasks/            # Task management module
│   │   ├── projects/         # Project module
│   │   ├── teams/            # Team module
│   │   ├── users/            # User module
│   │   ├── prisma/           # Prisma service
│   │   └── main.ts           # Application entry point
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── migrations/       # Migration history
│   ├── Dockerfile            # Docker configuration
│   ├── nest-cli.json         # NestJS CLI config
│   └── package.json
│
├── PLAN.md                    # Phase 1 implementation plan
├── README.md                  # This file
├── DEPLOYMENT_GUIDE.md        # Detailed deployment guide
├── VERCEL_PROXY_FIX.md        # Vercel proxy configuration
├── SECURITY.md                # Security documentation
└── docker-compose.yml         # Local development with Docker
```

---

## 🧪 Testing

### Backend Tests

```bash
cd server

# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```

### Frontend Tests

```bash
cd client

# Run tests (if implemented)
pnpm run test

# E2E tests with Playwright (if configured)
pnpm run test:e2e
```

### Manual Testing Checklist

- [ ] User registration with validation
- [ ] User login with correct credentials
- [ ] Login failure with wrong credentials
- [ ] Protected routes redirect to login
- [ ] Create task (verify in database)
- [ ] Update task (optimistic UI update)
- [ ] Delete task (confirm deletion)
- [ ] Try to delete another user's task (should fail)
- [ ] Logout (cookie cleared)
- [ ] Rate limiting (exceed limit, verify 429 error)

---

## 📊 Git Commit History

This project follows **Conventional Commits** for clear history:

```bash
# View commit history
git log --oneline --graph

# Example commits:
# feat: implement dashboard with task grid
# fix: cross-origin cookie configuration for Railway
# security: add rate limiting to auth endpoints
# docs: update README with deployment guide
```

---

## 🔒 Security Audit

### ✅ OWASP Top 10 Compliance

| Vulnerability | Mitigation |
|---------------|------------|
| A01: Broken Access Control | IDOR protection on all endpoints |
| A02: Cryptographic Failures | Argon2 for passwords, HTTPS only |
| A03: Injection | Prisma ORM prevents SQL injection |
| A04: Insecure Design | Security-first architecture |
| A05: Security Misconfiguration | Helmet, CORS, CSP configured |
| A06: Vulnerable Components | Regular dependency updates |
| A07: Authentication Failures | JWT + secure cookies + rate limiting |
| A08: Software Integrity Failures | Git commit verification |
| A09: Logging Failures | Structured logging (production) |
| A10: SSRF | Input validation on all URLs |

---

## 📝 Environment Variables

### Backend (.env)

```bash
# Database
DATABASE_URL="postgresql://user:pass@host:5432/twistlist"

# Secrets (generate with: openssl rand -base64 32)
JWT_SECRET="your-jwt-secret-here"
COOKIE_SECRET="your-cookie-secret-here"

# Server
PORT=3000
NODE_ENV=production

# CORS (your Vercel domain)
CORS_ORIGIN="https://twist-list.vercel.app"
```

### Frontend (.env)

```bash
# Local development only
BACKEND_URL=http://localhost:3000

# DO NOT SET IN VERCEL:
# NEXT_PUBLIC_API_URL (uses proxy instead)
```

**⚠️ IMPORTANT:** Never commit `.env` files with real secrets!

---

## 🤝 Contributing

This is an assessment project, but contributions for learning purposes are welcome:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is created for the TwistDigital technical assessment.

---

## 👤 Author

**Zayan Mohamed**
- GitHub: [@Zayan-Mohamed](https://github.com/Zayan-Mohamed)
- Project: [TwistList](https://github.com/Zayan-Mohamed/TwistList)

---

## 🎓 Assessment Notes

### What Went Well
- ✅ Comprehensive security implementation (Argon2, JWT, IDOR protection)
- ✅ Clean, modular architecture (NestJS modules, Next.js app router)
- ✅ Type-safe development across the stack
- ✅ Production deployment with proper CI/CD
- ✅ Detailed documentation and clear commit history

### Challenges Overcome
- Cross-origin cookie authentication (solved with Vercel proxy)
- Railway reverse proxy configuration (trustProxy: true)
- Optimistic UI updates with React Query
- Prisma 7 configuration for Railway deployment

### Future Improvements
- Implement refresh tokens for longer sessions
- Add WebSocket support for real-time collaboration
- Implement AI-assisted task breakdown feature
- Add comprehensive E2E tests with Playwright
- Set up monitoring and observability (Sentry, DataDog)

---

## 📞 Support

For questions about this assessment submission:
- **Email:** Contact through GitHub profile
- **Issues:** [GitHub Issues](https://github.com/Zayan-Mohamed/TwistList/issues)

---

**Last Updated:** February 18, 2026  
**Status:** ✅ Ready for Assessment Review
