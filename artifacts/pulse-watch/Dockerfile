# syntax=docker/dockerfile:1
# ─── Stage 1: builder ────────────────────────────────────────────────────────
FROM node:24-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace manifests first for layer caching
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

COPY lib/db/package.json               ./lib/db/
COPY lib/api-spec/package.json         ./lib/api-spec/
COPY lib/api-zod/package.json          ./lib/api-zod/
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/pulse-watch/package.json ./artifacts/pulse-watch/
COPY artifacts/mockup-sandbox/package.json ./artifacts/mockup-sandbox/
COPY scripts/package.json              ./scripts/

RUN pnpm install --frozen-lockfile

# Copy source
COPY lib/                   ./lib/
COPY artifacts/pulse-watch/ ./artifacts/pulse-watch/

# Vite requires PORT and BASE_PATH at build time.
# For Docker we serve at the root path on port 3000.
ARG PORT=3000
ARG BASE_PATH=/
ENV PORT=$PORT
ENV BASE_PATH=$BASE_PATH
# Suppress Replit-only dev plugins
ENV NODE_ENV=production

RUN pnpm --filter @workspace/pulse-watch run build

# ─── Stage 2: runtime (nginx) ─────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

COPY artifacts/pulse-watch/nginx.conf /etc/nginx/conf.d/pulse-watch.conf

# Copy built static assets
COPY --from=builder /app/artifacts/pulse-watch/dist/public /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
