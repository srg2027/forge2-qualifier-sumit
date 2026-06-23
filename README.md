# Forge2 Qualifier Kanban

AI-assisted Kanban board for the Forge2 qualifier. The app includes a Laravel 12 API, a React + Vite frontend, drag-and-drop task movement, and an optional Hermes/OpenClaw/Slack workflow endpoint that uses the already configured agent stack.

## Project Structure

- `kanban-api/` - Laravel backend API.
- `kanban-frontend/` - React frontend.
- `render.yaml` - Render blueprint for the backend and Postgres database.
- `kanban-frontend/vercel.json` - Vercel frontend config.

## Backend

Local setup:

```bash
cd kanban-api
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

API routes:

- `GET /api/boards`
- `POST /api/boards`
- `PUT /api/boards/{id}`
- `DELETE /api/boards/{id}`
- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/{id}`
- `DELETE /api/tasks/{id}`
- `PATCH /api/tasks/{id}/status`
- `POST /api/agent/events`

Task statuses are `todo`, `in_progress`, and `done`.

## Frontend

Local setup:

```bash
cd kanban-frontend
npm install
cp .env.example .env
npm run dev
```

Set `VITE_API_URL` to the backend API URL. For local Laravel, use:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

## Agent Workflow

Slack, Hermes, OpenClaw, and Gemini are treated as existing working services. This app integrates with them through optional webhook env vars:

```env
HERMES_WEBHOOK_URL=
OPENCLAW_WEBHOOK_URL=
SLACK_WEBHOOK_URL=
SLACK_AGENT_CHANNELS=sprint-main,agent-coder,agent-log
```

When tasks are created, updated, moved, or deleted, the frontend calls `POST /api/agent/events`. The backend forwards the event to configured webhooks and logs the event locally when a webhook is not configured.

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

Backend on Render:

1. Connect the GitHub repo.
2. Use `render.yaml`.
3. Set `FRONTEND_URL` to the Vercel app origin.
4. Add `HERMES_WEBHOOK_URL`, `OPENCLAW_WEBHOOK_URL`, and `SLACK_WEBHOOK_URL` if live forwarding is required.

Frontend on Vercel:

1. Set root directory to `kanban-frontend`.
2. Set `VITE_API_URL` to the Render API URL plus `/api`.
3. Deploy with the included `vercel.json`.
