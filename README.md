# Forge2 Qualifier Kanban

AI-assisted Kanban board for the Forge2 qualifier. The app includes a Laravel 12 API, a React + Vite frontend, drag-and-drop task movement, and an optional Hermes/OpenClaw/Slack workflow endpoint that uses the already configured agent stack.

## Project Structure

* `kanban-api/` - Laravel backend API
* `kanban-frontend/` - React frontend
* `render.yaml` - Render deployment blueprint
* `kanban-frontend/vercel.json` - Vercel configuration
* `SKILL.md` - Hermes skill definition
* `agent-log.md` - Agent activity log

## Features

* Board CRUD
* Task CRUD
* Task status updates
* Drag-and-drop Kanban workflow
* Laravel REST API
* React + Vite frontend
* Optional Hermes/OpenClaw/Slack event integration

## Backend

```bash
cd kanban-api
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

## Frontend

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

## Verification

Backend:

```bash
cd kanban-api
php artisan test
```

Frontend:

```bash
cd kanban-frontend
npm run lint
npm run build
```

## Deployment

Backend: Render

Frontend: Vercel

## Agent Workflow

Existing Hermes, OpenClaw, Gemini and Slack integrations can be connected through webhook environment variables:

* HERMES_WEBHOOK_URL
* OPENCLAW_WEBHOOK_URL
* SLACK_WEBHOOK_URL
