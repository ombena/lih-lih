# **Feature PRD: Docker Infrastructure & Containerization**

**Project:** LihLih Backend Infrastructure

**Focus:** Local Development & Production Deployment Setup (Monorepo)

**Goal:** Containerize the LihLih backend stack (Node.js, PostgreSQL, Redis, PgBouncer, and BullMQ) using Docker Compose at the root of the workspace, allowing seamless development alongside the frontend apps.

## **1\. Executive Summary**

As the LihLih platform has grown to include background jobs (BullMQ), connection pooling (PgBouncer), and caching (Redis), setting up a local development environment manually has become complex.

By wrapping our stack in **Docker** at the root project level, a developer can spin up the entire database, cache, message queue, and API with a single command: docker-compose up \-d.

## **2\. The Monorepo Folder Structure**

Your development folder should look exactly like this:

lihlih-project/  
│  
├── lihlih-client/         \# Expo React Native App  
├── lihlih-driver/         \# Expo React Native App  
├── lihlih-store/          \# Vite React Web App  
├── lihlih-backend/        \# Express/Node.js API  
│   ├── src/  
│   ├── prisma/  
│   ├── package.json  
│   └── Dockerfile         \<-- Goes inside the backend folder  
│  
└── docker-compose.yml     \<-- Goes in the ROOT folder

## **3\. Docker Compose Configuration (docker-compose.yml)**

Place this file in the **root** lihlih-project directory.

### **3.1. Base docker-compose.yml**

version: '3.8'

services:  
  \# 1\. The Primary Database  
  db:  
    image: postgres:15-alpine  
    container\_name: lihlih-postgres  
    restart: always  
    environment:  
      POSTGRES\_USER: ${DB\_USER:-postgres}  
      POSTGRES\_PASSWORD: ${DB\_PASSWORD:-lihlih\_secret}  
      POSTGRES\_DB: ${DB\_NAME:-lihlih\_db}  
    ports:  
      \- "5432:5432"  
    volumes:  
      \- pgdata:/var/lib/postgresql/data

  \# 2\. Connection Pooler  
  pgbouncer:  
    image: edoburu/pgbouncer  
    container\_name: lihlih-pgbouncer  
    restart: always  
    environment:  
      DATABASE\_URL: "postgres://${DB\_USER:-postgres}:${DB\_PASSWORD:-lihlih\_secret}@db:5432/${DB\_NAME:-lihlih\_db}"  
      POOL\_MODE: transaction  
      MAX\_CLIENT\_CONN: 1000  
      DEFAULT\_POOL\_SIZE: 20  
    ports:  
      \- "6432:6432"  
    depends\_on:  
      \- db

  \# 3\. Redis (Cache, Pub/Sub, BullMQ Broker)  
  redis:  
    image: redis:7-alpine  
    container\_name: lihlih-redis  
    restart: always  
    ports:  
      \- "6379:6379"  
    volumes:  
      \- redisdata:/data  
    command: redis-server \--appendonly yes \# Ensures BullMQ jobs survive a container restart

  \# 4\. The Node.js Application  
  api:  
    build:   
      context: ./lihlih-backend \# Tells Docker to look inside the backend folder  
    container\_name: lihlih-api  
    restart: always  
    ports:  
      \- "3000:3000"  
    environment:  
      \# Prisma connects to PgBouncer for API traffic  
      DATABASE\_URL: "postgresql://${DB\_USER:-postgres}:${DB\_PASSWORD:-lihlih\_secret}@pgbouncer:6432/${DB\_NAME:-lihlih\_db}?pgbouncer=true"  
      \# Prisma connects directly to Postgres for migrations  
      DIRECT\_URL: "postgresql://${DB\_USER:-postgres}:${DB\_PASSWORD:-lihlih\_secret}@db:5432/${DB\_NAME:-lihlih\_db}"  
      REDIS\_URL: "redis://redis:6379"  
      PORT: 3000  
    depends\_on:  
      \- pgbouncer  
      \- redis  
    volumes:  
      \# Maps your local code to the container so you don't have to rebuild on every save\!  
      \- ./lihlih-backend/src:/usr/src/app/src 

volumes:  
  pgdata:  
  redisdata:

## **4\. Implementation Step-by-Step**

### **4.1. The Dockerfile (Inside lihlih-backend/)**

To build the api container, create a Dockerfile inside your **lihlih-backend/** directory.

\# Use lightweight Node image  
FROM node:18-alpine

\# Set working directory  
WORKDIR /usr/src/app

\# Copy package files  
COPY package\*.json ./  
COPY prisma ./prisma/

\# Install dependencies  
RUN npm install

\# Generate Prisma Client  
RUN npx prisma generate

\# Copy the rest of the application code  
COPY . .

\# Build the TypeScript code (if applicable)  
RUN npm run build

\# Expose API port  
EXPOSE 3000

\# Start the server (ensure package.json has a "start" script)  
CMD \["npm", "start"\]

### **4.2. Handling Prisma Migrations in Docker**

When deploying via Docker, the database container might be completely empty. You need to run migrations *after* the containers spin up.

**Command sequence for the developer (Run from lihlih-project/ root):**

1. docker-compose up \-d \--build (Starts all services in the background).  
2. docker exec \-it lihlih-api npx prisma migrate deploy (Runs structural changes on the db via DIRECT\_URL).  
3. docker exec \-it lihlih-api npx ts-node prisma/seeds/seed.ts (Fills the database with the test Stores and Drivers).

## **5\. BullMQ Specific Considerations**

Because BullMQ runs inside the api container:

* The connection string in your backend code must use the Docker internal network hostname: redis://redis:6379.  
* The redis service in the docker-compose.yml uses the \--appendonly yes command. This ensures that if the Redis container crashes, all delayed 15-minute background jobs are saved to disk and instantly restored upon reboot. No ghost orders will be left behind\!

## **6\. Acceptance Criteria (DoD)**

* \[ \] A Dockerfile is placed inside the lihlih-backend folder.  
* \[ \] A docker-compose.yml file is placed in the root lihlih-project folder.  
* \[ \] The docker-compose.yml successfully mounts ./lihlih-backend/src as a volume for live-reloading during development.  
* \[ \] Persistent named volumes (pgdata and redisdata) are configured so database and job data survive container restarts.  
* \[ \] A new developer can clone the repository, run docker-compose up at the root level, and have a fully functioning backend with zero manual configuration.