# Roadmap: Backend Containerization & Scaling Strategy

This roadmap outlines the transition of the LihLih backend to a fully containerized architecture, incorporating high-scale performance optimizations as defined in the **Docker Infrastructure** and **Scaling Strategy** PRDs.

---

## Phase 1: Foundation & Local Environment
**Goal:** Establish environment parity and simplify developer onboarding with a "Single Command" setup.

### Milestone 1.1: Backend Dockerization
- [x] Create a multi-stage `Dockerfile` in `lihlih-backend/` using `node:20-alpine`.
- [x] Implement Prisma Client generation during the build process.
- [x] Optimize `.dockerignore` to keep image sizes small.

### Milestone 1.2: Root Orchestration
- [x] Create the master `docker-compose.yml` at the project root.
- [x] Configure the `db` service (PostgreSQL 15) with persistent volumes (`pgdata`).
- [x] Define the `api` service with environment variable mapping for local development.

### Milestone 1.3: Developer Experience (DX)
- [x] Implement volume mounting for `lihlih-backend/src` to enable hot-reloading.
- [x] Document the `docker-compose up --build` workflow for the team.

---

## Phase 2: Scaling Infrastructure (Shield & Speed)
**Goal:** Protect the database and accelerate data retrieval using PgBouncer and Redis.

### Milestone 2.1: Database Shielding
- [x] Add `pgbouncer` to `docker-compose.yml` for connection pooling.
- [x] Update backend configuration to route transactional traffic through PgBouncer (Port 6432).
- [x] Configure `DIRECT_URL` for Prisma migrations to bypass the pooler.

### Milestone 2.2: Caching & Resilience
- [x] Add `redis:7-alpine` to the stack with `appendonly yes` for data durability.
- [x] Implement the "Cache-Aside" pattern for high-frequency endpoints (e.g., Wilayas/Regions).
- [x] Set up persistent Redis volumes (`redisdata`).

### Milestone 2.3: Background Job Reliability
- [x] Configure **BullMQ** to connect to the Redis container.
- [x] Implement the 15-minute "Abandoned Order" auto-cancellation logic.

---

## Phase 3: Real-Time & High-Frequency Data
**Goal:** Scale WebSockets horizontally and handle driver tracking efficiently.

### Milestone 3.1: WebSocket Horizontal Scaling
- [x] Integrate the **Socket.io Redis Adapter**.
- [x] Ensure seamless event broadcasting across multiple API instances.

### Milestone 3.2: GPS Tracking Optimization
- [x] Migrate Driver GPS pings from PostgreSQL to **Redis GeoHashes**.
- [x] Implement direct WebSocket broadcasting for real-time map updates (bypassing DB writes).

### Milestone 3.3: Distributed Logic
- [x] Implement **Redis Distributed Locks (Redlock)** for race-condition sensitive tasks like "Order Claiming".

---

## Phase 4: Production Readiness & Monitoring
**Goal:** Hardening the infrastructure for cloud deployment.

### Milestone 4.1: Production Hardening
- [ ] Create `docker-compose.prod.yml` for cloud environments.
- [ ] Switch from source code volumes to "baked-in" code for production images.
- [ ] Implement health checks for all services.

### Milestone 4.2: Observability
- [ ] Set up centralized logging for Docker containers.
- [ ] Configure resource monitoring (CPU/RAM) for the scaling stack.
