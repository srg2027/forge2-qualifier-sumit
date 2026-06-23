---
name: kanban-builder
description: Teaches Hermes to build a full-stack Kanban board using Laravel and React, coordinating with OpenClaw via Slack.
version: 1.0.0
author: Sumit Kumar
---

# Kanban Board Builder Skill

This skill enables Hermes to orchestrate the construction of a full-stack Kanban board application by coordinating tasks with OpenClaw.

## Trigger Phrases
- "build the kanban board"
- "start the kanban sprint"
- "create kanban API"
- "scaffold the backend"

## Workflow

### Phase 1: Backend Scaffolding
1. Post to `#agent-coder`: "Create Laravel 11 project in `./api` directory"
2. Wait for OpenClaw confirmation
3. Post to `#agent-coder`: "Generate migrations for: boards, columns, cards tables"
4. Post to `#agent-coder`: "Create REST API controllers for boards, columns, cards (CRUD)"
5. Post to `#agent-coder`: "Add CORS middleware and API routes"
6. Post to `#agent-log`: "Backend scaffolding complete"

### Phase 2: Frontend Scaffolding
1. Post to `#agent-coder`: "Create React + Vite project in `./web` directory"
2. Post to `#agent-coder`: "Build Kanban board UI with drag-and-drop columns"
3. Post to `#agent-coder`: "Connect frontend to Laravel API via axios"
4. Post to `#agent-log`: "Frontend scaffolding complete"

### Phase 3: Integration & Deploy
1. Post to `#agent-coder`: "Create Procfile and render.yaml for Render deployment"
2. Post to `#agent-coder`: "Create vercel.json for Vercel deployment"
3. Post to `#agent-coder`: "Commit all files and push to main branch"
4. Post to `#sprint-main`: "✅ Kanban board ready! Backend: [render URL] | Frontend: [vercel URL]"

## Data Model

```
Board
  id, name, description, created_at

Column
  id, board_id, name, position, created_at

Card
  id, column_id, title, description, position, created_at
```

## API Endpoints

```
GET    /api/boards
POST   /api/boards
GET    /api/boards/{id}
PUT    /api/boards/{id}
DELETE /api/boards/{id}

GET    /api/boards/{id}/columns
POST   /api/boards/{id}/columns
PUT    /api/columns/{id}
DELETE /api/columns/{id}

GET    /api/columns/{id}/cards
POST   /api/columns/{id}/cards
PUT    /api/cards/{id}
DELETE /api/cards/{id}
```
