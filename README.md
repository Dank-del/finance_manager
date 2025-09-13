# Finance Manager

A full-stack finance management application built with React, TypeScript, Express, and PostgreSQL.

## Prerequisites

- Docker and Docker Compose
- Bun (for local development)

## Quick Start with Docker

1. Clone the repository
2. Copy the environment file:
   ```bash
   cp .env.example .env
   ```
3. Start all services:
   ```bash
   docker-compose up -d
   ```
4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Database: localhost:5432

## Local Development

To install dependencies:

```bash
bun install
```

To run in development mode:

```bash
bun run dev
```

This will start both frontend (port 3000) and backend (port 3001) services.

## Services

- **Frontend**: React + TypeScript + Vite (port 3000)
- **Backend**: Express + TypeScript + Bun (port 3001)
- **Database**: PostgreSQL (port 5432)

## Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild and restart
docker-compose up -d --build

# Clean up
docker-compose down -v
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `POSTGRES_DB`: Database name
- `POSTGRES_USER`: Database user
- `POSTGRES_PASSWORD`: Database password
- `JWT_SECRET`: JWT signing secret (change in production)

## Project Structure

```
apps/
├── backend/          # Express API server
└── frontend/         # React application
```

This project was created using `bun init` in bun v1.2.21. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
