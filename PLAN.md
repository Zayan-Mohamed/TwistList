# Phase 1: Implementation Plan

## 1. Backend Choice: NestJS (Fastify Adapter)
I have selected **NestJS** utilizing the **Fastify** adapter instead of the standard Express platform.

* **Justification:** * **Architecture:** NestJS enforces a modular architecture (Modules, Controllers, Services), ensuring separation of concerns and maintainability, which aligns with the "Engineering Maturity" evaluation criteria.
    * **Performance:** Fastify offers significantly higher throughput and lower overhead compared to Express, demonstrating a focus on scalability.
    * **Type Safety:** NestJS is built with TypeScript natively, ensuring strict typing across the backend logic.

## 2. High-Level Architecture
I will use a **Decoupled Monorepo** structure. The Frontend and Backend reside in separate directories within a single repository but function as independent applications.

* **Frontend:** Next.js (App Router) for server-side rendering and optimized routing.
* **Backend:** NestJS acting as a REST API Gateway.
* **Database:** PostgreSQL (Relational integrity for User-Task relationships).
* **ORM:** Prisma (for type-safe database access).

### System Diagram
[Client (Next.js)] <---> [API Gateway (NestJS + Throttler)] <---> [PostgreSQL (Prisma)]

## 3. Security Considerations
I have identified the following risks and planned mitigations to satisfy the 20% Security weight:

### A. Authentication & Authorization
* **Risk:** Weak passwords and unauthorized access.
* **Mitigation:** * Use **Argon2** for password hashing (superior resistance to GPU cracking compared to bcrypt).
    * Implement **JWT (JSON Web Tokens)** for stateless session management.
    * **Role-Based Access Control (RBAC):** Middleware to ensure users can only modify their own tasks (`DELETE /tasks/:id` checks ownership).

### B. Input Validation & Integrity
* **Risk:** SQL Injection and Malformed Data.
* **Mitigation:** * **Zod** (Frontend) and **Class-Validator** (Backend) to strip unknown properties and validate types before processing.
    * **Prisma ORM** to automatically parameterize queries, neutralizing SQL injection attacks.

### C. Infrastructure Security
* **Risk:** DoS attacks and Brute Force.
* **Mitigation:** * **Rate Limiting:** Implement `@nestjs/throttler` to limit repeated requests from the same IP.
    * **CORS:** Strict configuration to allow requests only from the frontend domain.
    * **Helmet:** HTTP header hardening.

## 4. Novelty Feature Plan
**"AI-Assisted Task Breakdown"**
I plan to implement an optional feature where users can input a vague task (e.g., "Move house"), and the system will use an LLM API to suggest sub-tasks (e.g., "Hire movers," "Pack kitchen," "Change address"), adding significant UX value.
