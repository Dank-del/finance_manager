FROM oven/bun:1

WORKDIR /app

# Copy root package.json and bun.lock for monorepo setup
COPY package.json bun.lock ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/

# Install all dependencies from root (monorepo)
RUN bun install --frozen-lockfile

# Copy backend source code
COPY apps/backend/ ./apps/backend/

# Change to backend directory and build
WORKDIR /app/apps/backend
RUN bun run build

EXPOSE 3001

CMD ["bun", "run", "start"]