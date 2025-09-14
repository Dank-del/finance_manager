FROM oven/bun:1

WORKDIR /app

COPY bun.lock ./
COPY apps/backend/package.json ./

RUN bun install --frozen-lockfile

COPY apps/backend/ ./

RUN bun run build

EXPOSE 3001

CMD ["bun", "run", "start"]