FROM oven/bun:1 as build

WORKDIR /app

COPY bun.lock ./
COPY apps/frontend/package.json ./

RUN bun install --frozen-lockfile

COPY apps/frontend/ ./

RUN bun run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]