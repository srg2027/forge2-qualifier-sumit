# 🏗️ Forge 2 · Edition 1 — Qualifier Submission

**Participant:** Sumit Kumar (`srg2027`)
**Workspace:** `forge2-sumit.slack.com`
**Stack:** OpenClaw + Hermes + Google Gemini 2.5 Flash

---

## 🤖 Agent Architecture

This project wires two AI agents together to collaboratively build a Kanban board:

| Agent | Role | Model |
|-------|------|-------|
| **Hermes** | Orchestrator / Brain | `google/gemini-2.5-flash` |
| **OpenClaw** | Coder / Executor | `google/gemini-2.5-flash` |

### Communication Flow

```
Sumit (Human) → #sprint-main → Hermes (Brain)
                                    ↓
                            #agent-coder → OpenClaw (Coder)
                                    ↓
                            #agent-log (audit trail)
```

---

## 📦 Project: Kanban Board (Laravel API + React Frontend)

A full-stack Kanban board where:
- **Hermes** breaks user stories into tasks
- **OpenClaw** writes the code, commits, and opens PRs
- All decisions are logged to `#agent-log`

### Tech Stack
- **Backend:** Laravel 11 (PHP 8.2+) REST API
- **Frontend:** React + Vite
- **Database:** SQLite (free tier)
- **Deploy:** Render (backend) + Vercel (frontend)

---

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/srg2027/forge2-qualifier-sumit.git
cd forge2-qualifier-sumit

# Copy env
cp .env.example .env

# Backend
cd api && composer install && php artisan migrate && php artisan serve

# Frontend
cd ../web && npm install && npm run dev
```

---

## 📋 Slack Channels

| Channel | Purpose |
|---------|---------|
| `#sprint-main` | Human ↔ Hermes communication |
| `#agent-coder` | OpenClaw coding tasks |
| `#agent-log` | Audit trail of all agent actions |

---

## 📁 Repository Structure

```
forge2-qualifier-sumit/
├── api/              # Laravel 11 REST API
├── web/              # React + Vite frontend
├── .env.example      # Required environment variables
├── ARCHITECTURE.md   # System design document
├── SKILL.md          # Hermes custom skill definition
└── agent-log.md      # Human-readable agent decision log
```

---

## ✅ Qualifier Checklist

- [x] OpenClaw installed and configured
- [x] Hermes installed and configured
- [x] Both agents using Google Gemini 2.5 Flash
- [x] Slack workspace created (`forge2-sumit`)
- [x] All 3 channels active (`#sprint-main`, `#agent-coder`, `#agent-log`)
- [x] GitHub repo created
- [ ] Kanban API (Laravel)
- [ ] Kanban frontend (React)
- [ ] Deployed to Render + Vercel
