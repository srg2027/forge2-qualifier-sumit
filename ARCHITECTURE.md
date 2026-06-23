# Architecture

## Overview

The system consists of a Laravel backend API and a React frontend.

```text
React Frontend
       |
       v
Laravel API
       |
       v
Database
```

Optional integrations:

```text
React
  |
  +--> Laravel API
           |
           +--> Hermes
           +--> OpenClaw
           +--> Slack
           +--> Gemini
```

## Backend

* Laravel 12 REST API
* Board model
* Task model
* CRUD endpoints
* Task status updates
* Validation and testing

Task statuses:

* todo
* in_progress
* done

## Frontend

* React + Vite
* Kanban board
* Drag and drop
* Create/Edit/Delete tasks
* API integration

## Deployment

Backend:

* Render

Frontend:

* Vercel

## Agent Integration

The application can optionally forward task events to:

* Hermes
* OpenClaw
* Slack

through webhook configuration.
