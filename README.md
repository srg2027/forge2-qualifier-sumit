# Forge2 Qualifier – AI-Assisted Kanban Board

A full-stack Kanban Board application built for the Forge2 Qualifier. The project combines a Laravel 12 backend, React + Vite frontend, PostgreSQL database, and an agent-ready architecture using Hermes, OpenClaw, Gemini, and Slack integrations.

---

## Live Demo

### Frontend

https://forge2-kanban-frontend.netlify.app

### Backend API

https://forge2-kanban-api-production.up.railway.app/api/boards

### GitHub Repository

https://github.com/srg2027/forge2-qualifier-sumit

---

## Project Overview

This application enables users to:

* Create and manage boards
* Create, edit, and delete tasks
* Move tasks across workflow stages
* Persist data using PostgreSQL
* Generate workflow events for AI agent integrations

Workflow:

Todo → In Progress → Done

---

## Tech Stack

### Frontend

* React
* Vite
* JavaScript
* Axios

### Backend

* Laravel 12
* PHP 8.2
* REST APIs
* Eloquent ORM

### Database

* PostgreSQL

### AI Agent Stack

* Hermes Agent v0.17.0
* OpenClaw 2026.6.9
* Google Gemini 2.5 Flash
* Slack Socket Mode

### Deployment

* Frontend: Netlify
* Backend: Railway
* Database: Railway PostgreSQL

---

## Project Structure

```text
forge2-qualifier-sumit/
│
├── kanban-api/
├── kanban-frontend/
├── ARCHITECTURE.md
├── SKILL.md
├── agent-log.md
├── DEPLOYMENT.md
└── README.md
```

---

## Features

### Board Management

* Create boards
* View boards
* Persist boards in PostgreSQL

### Task Management

* Create tasks
* Edit tasks
* Delete tasks
* Update task status

### Kanban Workflow

* Drag and drop task movement
* Todo → In Progress → Done workflow
* Persistent task state

### Agent Workflow Integration

* Hermes integration points
* OpenClaw integration points
* Slack event channels
* Workflow event generation

---

## Backend Setup

```bash
cd kanban-api

composer install

cp .env.example .env

php artisan key:generate

php artisan migrate

php artisan serve
```

Backend runs at:

```text
http://127.0.0.1:8000
```

---

## Frontend Setup

```bash
cd kanban-frontend

npm install

cp .env.example .env

npm run dev
```

Set:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

Frontend runs at:

```text
http://localhost:5173
```

---

## Testing

### Backend

```bash
cd kanban-api

php artisan test
```

### Frontend

```bash
cd kanban-frontend

npm run lint

npm run build
```

---

## Architecture

```text
User
  │
  ▼
React Frontend (Netlify)
  │
  ▼
Laravel API (Railway)
  │
  ▼
PostgreSQL Database
```

### Agent Layer

```text
Hermes Agent
      │
      ▼
Gemini 2.5 Flash
      │
      ▼
OpenClaw
      │
      ▼
Slack Channels

#sprint-main
#agent-coder
#agent-log
```

---

## Agent Artifacts

### SKILL.md

Custom Hermes skill defining the Kanban Builder workflow.

### agent-log.md

Chronological log of agent decisions and actions.

### ARCHITECTURE.md

System architecture and integration design.

---

## Slack Integration

OpenClaw was configured with Slack Socket Mode and dedicated channels:

* #sprint-main
* #agent-coder
* #agent-log

Workflow events can be forwarded through configurable webhook endpoints.

---

## Environment Variables

### Backend

```env
APP_ENV=production
APP_DEBUG=false

DB_CONNECTION=pgsql

FRONTEND_URL=https://forge2-kanban-frontend.netlify.app

HERMES_WEBHOOK_URL=
OPENCLAW_WEBHOOK_URL=
SLACK_WEBHOOK_URL=

SLACK_AGENT_CHANNELS=sprint-main,agent-coder,agent-log
```

### Frontend

```env
VITE_API_URL=https://forge2-kanban-api-production.up.railway.app/api
```

---

## Deployment

### Frontend

Netlify

### Backend

Railway

### Database

Railway PostgreSQL

---

## Author

Sumit Kumar

Forge2 Qualifier Submission – 2026
