# Multi-stage Dockerfile for Node.js Express + Vite fullstack app
# Stage 1: Build & Dependencies
FROM node:22-slim AS builder

WORKDIR /app

# Ensure clean npm environment and legacy peer deps resolution
ENV NPM_CONFIG_LEGACY_PEER_DEPS=true

# Copy package files
COPY package*.json ./

# Install all dependencies needed for building (safe for missing lockfile)
RUN npm install --legacy-peer-deps

# Copy source code and build client + server bundle
COPY . .
RUN npm run build

# Stage 2: Production Runner
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV NPM_CONFIG_LEGACY_PEER_DEPS=true

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps

# Copy built frontend, compiled server, and data directory
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/data ./data

# Expose app port for Coolify / Traefik
EXPOSE 3000

# Run native node server
CMD ["node", "server.js"]
