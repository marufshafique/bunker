# Bunker

A full-stack web application built with **Rust** (backend) and **Vue 3** (frontend).

## Tech Stack

| Layer    | Technology                                      |
| -------- | ----------------------------------------------- |
| Backend  | Rust, Actix-web, SQLx (PostgreSQL)              |
| Frontend | Vue 3, TypeScript, Vite, Tailwind CSS, shadcn-vue |
| Database | PostgreSQL 17                                   |
| Infra    | Docker, Docker Compose                          |

## Project Structure

```
.
├── backend/          # Rust API server (Actix-web)
│   ├── src/          # Application source
│   ├── migrations/   # SQLx database migrations
│   └── uploads/      # File upload storage
├── web/              # Vue 3 frontend
│   └── src/          # Vue components, routes, stores
└── compose.yml       # Docker Compose configuration
```

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose

### Run with Docker

```bash
docker compose up --build
```

This starts all services:

| Service    | URL                  |
| ---------- | -------------------- |
| Frontend   | http://localhost:5173 |
| Backend API | http://localhost:7000 |
| PostgreSQL | localhost:5435       |

### Local Development

#### Backend

```bash
cd backend
# Ensure PostgreSQL is running and configured in config.yml
cargo run
```

#### Frontend

```bash
cd web
npm install
npm run dev
```

The Vite dev server will start at `http://localhost:5173` with hot module replacement.
