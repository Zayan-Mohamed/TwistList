# TwistList Server - Secure Task Management API

A robust, scalable, and secure Task Management System built with NestJS, featuring enterprise-grade security practices and comprehensive API documentation.

## Security Features

- **Argon2 Password Hashing**: Industry-standard password security
- **JWT Authentication**: Secure token-based authentication with 15-minute expiration
- **IDOR Prevention**: All endpoints verify user ownership of resources
- **Rate Limiting**: Throttler guards to prevent brute-force attacks
- **Input Validation**: Strict validation using `class-validator` with whitelist and forbidNonWhitelisted enabled
- **Helmet Security**: Content Security Policy and other HTTP headers protection
- **Response Sanitization**: DTOs exclude sensitive data like passwords

## Tech Stack

- **Framework**: NestJS v10+ with Fastify Adapter
- **Language**: TypeScript (Strict mode)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: Passport JWT
- **Documentation**: Swagger/OpenAPI
- **Security**: Argon2, Helmet, Throttler

## Prerequisites

- Node.js (v18+)
- pnpm (v8+)
- PostgreSQL (v14+)

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd TwistList/server
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Setup environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/twistlist"
   JWT_SECRET="your-super-secret-jwt-key"
   PORT=3000
   CORS_ORIGIN="http://localhost:3001"
   ```

4. **Run database migrations**

   ```bash
   pnpm prisma migrate deploy
   ```

5. **Generate Prisma Client**
   ```bash
   pnpm prisma generate
   ```

## Running the Application

### Development

```bash
pnpm start:dev
```

### Production

```bash
pnpm build
pnpm start:prod
```

### Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Test coverage
pnpm test:cov
```

## API Documentation

Once the application is running, access the interactive Swagger documentation at:

```
http://localhost:3000/api
```

## Authentication

### Register a New User

```bash
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "john_doe",
  "password": "SecurePassword123!"
}
```

### Sign In

```bash
POST /auth/signin
Content-Type: application/json

{
  "emailOrUsername": "user@example.com",
  "password": "SecurePassword123!"
}
```

Response:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Using the JWT Token

Include the token in the Authorization header for all protected endpoints:

```bash
Authorization: Bearer <your_access_token>
```

## API Endpoints

### Authentication

- `POST /auth/signup` - Register a new user
- `POST /auth/signin` - Sign in

### User Profile

- `GET /users/profile` - Get current user profile
- `PATCH /users/profile` - Update profile
- `DELETE /users/account` - Delete account

### Tasks

- `POST /tasks` - Create a task (author set automatically from JWT)
- `GET /tasks` - Get all user's tasks (author or assignee)
- `GET /tasks/:id` - Get specific task (with IDOR protection)
- `PATCH /tasks/:id` - Update task (author or assignee only)
- `DELETE /tasks/:id` - Delete task (author only)

### Projects

- `POST /projects` - Create a project
- `GET /projects` - Get all user's projects (via team membership)
- `GET /projects/:id` - Get specific project
- `PATCH /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project

### Teams

- `POST /teams` - Create a team
- `GET /teams` - Get user's teams
- `GET /teams/:id` - Get specific team
- `PATCH /teams/:id` - Update team
- `DELETE /teams/:id` - Delete team

## Architecture

### Security Architecture

```
┌─────────────────────────────────────┐
│   Global Validation Pipe            │
│   - Whitelist: true                 │
│   - ForbidNonWhitelisted: true      │
└─────────────────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│   Throttler Guard (Rate Limiting)   │
│   - 10 requests per 60 seconds      │
└─────────────────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│   JWT Guard (Protected Routes)      │
│   - JWT Strategy                    │
│   - User Validation                 │
└─────────────────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│   Service Layer (Business Logic)    │
│   - IDOR Prevention                 │
│   - Authorization Checks            │
└─────────────────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│   Response DTOs                     │
│   - Password exclusion              │
│   - Data sanitization               │
└─────────────────────────────────────┘
```

### Module Structure

```
src/
├── auth/              # Authentication module
│   ├── decorator/     # Custom decorators (GetUser)
│   ├── dto/           # DTOs and response models
│   ├── guard/         # JWT Guard
│   └── strategy/      # JWT Strategy
├── tasks/             # Task management
├── projects/          # Project management
├── teams/             # Team management
├── users/             # User profile management
└── prisma/            # Database service
```

## Security Best Practices Implemented

1. **IDOR Prevention**: Every endpoint verifies user ownership

   ```typescript
   if (task.authorUserId !== userId && task.assignedUserId !== userId) {
     throw new ForbiddenException('You do not have permission');
   }
   ```

2. **Password Security**: Argon2 hashing

   ```typescript
   const hash = await argon.hash(dto.password);
   ```

3. **Input Validation**: Strict DTOs

   ```typescript
   @IsString()
   @IsNotEmpty()
   @MinLength(8)
   password: string;
   ```

4. **Rate Limiting**: Throttler on auth endpoints

   ```typescript
   @Throttle({ default: { limit: 3, ttl: 60000 } })
   ```

5. **Response Sanitization**: Exclude sensitive data
   ```typescript
   @Exclude()
   password: string;
   ```

## Database Schema

See [prisma/schema.prisma](./prisma/schema.prisma) for the complete data model.

Key entities:

- **User**: Authentication and profile
- **Task**: Task management with author and assignee
- **Project**: Project organization
- **Team**: Team collaboration
- **ProjectTeam**: Many-to-many relationship

## License

MIT

## 👥 Support

For issues or questions, please open an issue on GitHub.
