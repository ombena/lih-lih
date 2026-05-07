# --- STAGE 1: Base ---
FROM node:20-alpine AS base
WORKDIR /usr/src/app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install
RUN npx prisma generate

# --- STAGE 2: Development ---
FROM base AS development
COPY . .
CMD ["npm", "run", "dev"]

# --- STAGE 3: Build ---
FROM base AS builder
COPY . .
RUN npm run build

# --- STAGE 4: Runtime ---
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Only copy production dependencies and compiled code
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install --only=production
RUN npx prisma generate

COPY --from=builder /usr/src/app/dist ./dist

# Expose API port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
