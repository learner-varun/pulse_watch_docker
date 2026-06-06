# syntax=docker/dockerfile:1

# ─── Stage 1: builder ────────────────────────────────────────────────────────
# Install the full monorepo and compile the esbuild bundle and Vite frontend.
FROM node:24-bookworm-slim AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace manifests first so dependency installation is cached
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# Copy every package.json in the workspace
COPY lib/db/package.json               ./lib/db/
COPY lib/api-spec/package.json         ./lib/api-spec/
COPY lib/api-zod/package.json          ./lib/api-zod/
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/pulse-watch/package.json ./artifacts/pulse-watch/
COPY artifacts/mockup-sandbox/package.json ./artifacts/mockup-sandbox/
COPY scripts/package.json              ./scripts/

RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy source after deps are installed
COPY tsconfig.base.json tsconfig.json ./
COPY lib/                   ./lib/
COPY artifacts/api-server/ ./artifacts/api-server/
COPY artifacts/pulse-watch/ ./artifacts/pulse-watch/

# Environment variables needed for frontend build
ARG PORT=8080
ARG BASE_PATH=/
ENV PORT=$PORT
ENV BASE_PATH=$BASE_PATH
ENV NODE_ENV=production

# Build both backend API and frontend Web apps
RUN pnpm --filter @workspace/api-server run build
RUN pnpm --filter @workspace/pulse-watch run build

# ─── Stage 2: runtime ────────────────────────────────────────────────────────
# Lean image containing only the compiled bundles
FROM node:24-bookworm-slim AS runtime

WORKDIR /app

# Copy the API server's compiled code to ./dist
COPY --from=builder /app/artifacts/api-server/dist ./dist

# Copy the React frontend's static files into ./public
# The Express server (app.ts) is configured to serve files from this directory
COPY --from=builder /app/artifacts/pulse-watch/dist/public ./public

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Start the Express server
CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
