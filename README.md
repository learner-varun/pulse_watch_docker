# Pulse Watch - API Health Monitoring Portal

Pulse Watch is an API health monitoring application that allows you to easily track the status, uptime, and performance of your API endpoints. It executes scheduled checks against configured curl commands to ensure your services meet expected status codes and response times.

## 🚀 Features

- **Endpoint Monitoring**: Add APIs to monitor by providing their curl commands.
- **Customizable Assertions**: Configure expected HTTP status codes and maximum acceptable response times for each endpoint.
- **Automated Execution**: Runs automated background health checks at a configurable interval (using `node-cron`).
- **Execution History & Metrics**: Track historical execution results including pass/fail rates, response times, and overall API health metrics.
- **Modern Dashboard**: A clean, responsive dashboard built with React, Radix UI, Tailwind CSS, and Recharts for data visualization.

## 🛠 Stack

- **Monorepo**: pnpm workspaces
- **Frontend**: React 19, Vite, Tailwind CSS (v4), Radix UI, Framer Motion, Recharts
- **Backend**: Express 5, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Validation**: Zod & drizzle-zod
- **API Client & Codegen**: Orval (generates React Query hooks from OpenAPI specs)
- **Containerization**: Docker & Docker Compose

## 📁 Repository Structure

- `artifacts/pulse-watch/`: The React web application (frontend).
- `artifacts/api-server/`: The Express backend application.
- `lib/db/`: Database schemas, migrations, and Drizzle ORM configuration.
- `lib/api-spec/`: OpenAPI specifications and Orval codegen settings.
- `lib/api-client-react/`: Generated React Query hooks for the frontend.
- `lib/api-zod/`: Generated Zod schemas for API validation.

## 🐳 Run & Operate (Docker)

The easiest way to run the application is using Docker Compose. This will spin up the PostgreSQL database, run necessary migrations, and start both the backend API and frontend web server.

```bash
docker-compose up -d --build
```

- The **Web Dashboard** will be available at: `http://localhost:80`
- The **API Server** will be running internally and proxied correctly.

## 💻 Local Development

If you prefer to run the application locally without Docker:

1. **Install Dependencies:**
   ```bash
   pnpm install
   ```

2. **Database Setup:**
   Ensure you have a PostgreSQL instance running. Set the `DATABASE_URL` environment variable.
   ```bash
   export DATABASE_URL="postgres://user:pass@localhost:5432/pulse_watch"
   ```

3. **Push Database Migrations:**
   ```bash
   pnpm --filter @workspace/db run push
   ```

4. **Run the API Server:**
   ```bash
   pnpm --filter @workspace/api-server run dev
   ```

5. **Run the Web Frontend:**
   ```bash
   pnpm --filter @workspace/pulse-watch run dev
   ```

## 📜 Available Scripts

- `pnpm run typecheck` — Full TypeScript typecheck across all packages in the workspace.
- `pnpm run build` — Typecheck and build all packages.
- `pnpm --filter @workspace/api-spec run codegen` — Regenerate API React Query hooks and Zod schemas from the OpenAPI spec if you modify the API contracts.

## ⚙️ Architecture Decisions

- **pnpm Workspaces**: Chosen for strict module boundaries between DB schemas, API specs, and the applications.
- **Contract-first API Design**: The API specification drives both the backend validation (Zod) and frontend data-fetching hooks (Orval + React Query), ensuring end-to-end type safety.
- **Dockerized Frontend**: The frontend is served using an Nginx container in production mode for optimized static file delivery.

## ⚠️ Gotchas

- **Supply-Chain Security Buffer**: The `pnpm-workspace.yaml` enforces a minimum release age of 1440 minutes (1 day) for new npm packages. If you try to install a package published very recently, it will be blocked.
- **Codegen on API changes**: Always run the codegen script (`pnpm --filter @workspace/api-spec run codegen`) after modifying the OpenAPI specification to ensure your frontend and validation schemas are up to date.
