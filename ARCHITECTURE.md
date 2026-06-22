# 🏛️ System Architecture — Forge 2 Qualifier

## Overview

This system is a **multi-agent AI coding pipeline** that autonomously builds software using human-in-the-loop supervision via Slack.

---

## Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     HUMAN (Sumit Kumar)                     │
│                    Slack: #sprint-main                      │
└─────────────────────┬───────────────────────────────────────┘
                      │ natural language instructions
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  HERMES (Orchestrator)                      │
│  Model: google/gemini-2.5-flash                             │
│  Role: Breaks tasks, manages sprint, coordinates agents     │
│  Memory: Cross-session recall via local state               │
└──────────┬──────────────────────────┬───────────────────────┘
           │ coding tasks             │ logs decisions
           ▼                          ▼
┌──────────────────────┐   ┌──────────────────────────────────┐
│  OPENCLAW (Coder)    │   │  Slack: #agent-log               │
│  Model: gemini-flash │   │  Audit trail of all actions      │
│  Role: Writes code,  │   └──────────────────────────────────┘
│  commits, opens PRs  │
│  Channel: #agent-coder│
└──────────┬───────────┘
           │ git commits + PRs
           ▼
┌─────────────────────────────────────────────────────────────┐
│              GitHub: srg2027/forge2-qualifier-sumit         │
└──────────┬──────────────────────────┬───────────────────────┘
           │ CI/CD                    │ CI/CD
           ▼                          ▼
┌───────────────────┐      ┌──────────────────────────────────┐
│  Render (Backend) │      │  Vercel (Frontend)               │
│  Laravel 11 API   │      │  React + Vite                    │
│  SQLite DB        │      │  Kanban Board UI                 │
└───────────────────┘      └──────────────────────────────────┘
```

---

## Data Flow

### 1. Task Intake
```
Human message in #sprint-main
    → Hermes reads via Socket Mode
    → Hermes decomposes into sub-tasks
    → Hermes posts task spec to #agent-coder
```

### 2. Code Generation
```
OpenClaw reads task from #agent-coder
    → Calls gemini-2.5-flash for code
    → Writes files to disk
    → git commit + push + open PR
    → Posts completion notice to #agent-log
```

### 3. Human Review
```
Human reviews PR on GitHub
    → Approves/requests changes
    → Hermes monitors PR state
    → Posts summary to #sprint-main
```

---

## Agent Configuration

### OpenClaw (`openclaw.json`)
```json
{
  "model": "google/gemini-2.5-flash",
  "provider": "gemini",
  "slack": {
    "enabled": true,
    "socketMode": true,
    "channels": ["agent-coder", "agent-log", "sprint-main"]
  }
}
```

### Hermes (`config.yaml`)
```yaml
provider: gemini
model: gemini-2.5-flash
memory:
  cross_session: true
slack:
  workspace: forge2-sumit
  listen: sprint-main
```

---

## Technology Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| LLM | Gemini 2.5 Flash | Free tier, 1M TPM, 1M context |
| Backend | Laravel 11 | PHP artisan scaffolding speeds up dev |
| Frontend | React + Vite | Fast HMR, modern ecosystem |
| Database | SQLite | Zero-config, perfect for demos |
| Deploy Backend | Render | Free tier, supports PHP |
| Deploy Frontend | Vercel | Free tier, instant deploys |
| Comms | Slack Socket Mode | No public URL needed |
