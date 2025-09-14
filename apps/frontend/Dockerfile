FROM oven/bun:1 as build

WORKDIR /app

# Copy root package.json and bun.lock for monorepo setup
COPY package.json bun.lock ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/

# Install all dependencies from root (monorepo)
RUN bun install --frozen-lockfile

# Copy frontend source code
COPY apps/frontend/ ./apps/frontend/

# Change to frontend directory and build
WORKDIR /app/apps/frontend
RUN bun run build

FROM nginx:alpine

COPY --from=build /app/apps/frontend/dist /usr/share/nginx/html

COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]