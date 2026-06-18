# syntax=docker/dockerfile:1
# ─── Stage 1: builder ────────────────────────────────────────────────────────
# Install the full monorepo and compile the esbuild bundle.
FROM node:24-bookworm-slim AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace manifests first so dependency installation is cached
# as long as lockfile / package.json files don't change.
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# Copy every package.json in the workspace (needed for pnpm to resolve workspaces)
COPY lib/db/package.json               ./lib/db/
COPY lib/api-spec/package.json         ./lib/api-spec/
COPY lib/api-zod/package.json          ./lib/api-zod/
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/pulse-watch/package.json ./artifacts/pulse-watch/
COPY artifacts/mockup-sandbox/package.json ./artifacts/mockup-sandbox/
COPY scripts/package.json              ./scripts/

RUN pnpm install --no-frozen-lockfile --ignore-scripts

# Copy source after deps are installed (better layer caching)
COPY tsconfig.base.json tsconfig.json ./
COPY lib/       ./lib/
COPY artifacts/api-server/ ./artifacts/api-server/

# Build the esbuild bundle (output: artifacts/api-server/dist/)
RUN pnpm --filter @workspace/api-server run build

# ─── Stage 2: runtime ────────────────────────────────────────────────────────
# Lean image — esbuild bundles all JS dependencies, so node_modules are not
# needed at runtime (only the dist/ folder).
FROM node:24-bookworm-slim AS runtime

WORKDIR /app

COPY --from=builder /app/artifacts/api-server/dist ./dist

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
