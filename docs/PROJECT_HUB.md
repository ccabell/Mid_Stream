# Mid_Stream Project Hub

**Version:** 1.0
**Created:** 2026-03-14
**Owner:** Chris Cabell
**Purpose:** Central command center for A360 Intelligence Extraction ecosystem

---

## Mission

Mid_Stream is the **unified frontend** for the A360 Intelligence Extraction ecosystem. It consolidates multiple scattered projects into one clean environment where you can:

1. **View** extraction outputs from consultation transcripts
2. **Execute** downstream agents (cross-sell, opportunities, email campaigns)
3. **Review** and approve extractions via HITL verification
4. **Manage** opportunities through the kanban board
5. **Navigate** to all related projects and documentation
6. **Share** sub-projects with third parties

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              MID_STREAM                                      │
│                     (Central Hub - This Project)                             │
│                                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Dashboard  │  │    Runs     │  │Opportunities│  │   Agents    │        │
│  │   (KPIs)    │  │   (List)    │  │  (Kanban)   │  │   (List)    │        │
│  └─────────────┘  └──────┬──────┘  └─────────────┘  └─────────────┘        │
│                          │                                                   │
│                   ┌──────▼──────┐                                           │
│                   │ Run Detail  │                                           │
│                   │ + HITL View │                                           │
│                   │ + Agents    │                                           │
│                   └──────┬──────┘                                           │
│                          │                                                   │
└──────────────────────────┼──────────────────────────────────────────────────┘
                           │
                           │ API Calls (via Vercel rewrite)
                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PROMPT RUNNER                                      │
│                    (Backend - DO NOT MODIFY)                                 │
│                                                                              │
│  Deployed: https://prompt-runner-production.up.railway.app                   │
│  Repo: ccabell/prompt-runner (private)                                       │
│                                                                              │
│  Responsibilities:                                                           │
│  • Process transcripts through extraction prompts                            │
│  • Store runs, outputs, opportunities in Supabase                            │
│  • Execute downstream agents (email_campaign, cross_sell, opportunities)     │
│  • Serve API endpoints for all frontends                                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Project Inventory

### Active Projects

| Project | Purpose | Location | Deployment | Status |
|---------|---------|----------|------------|--------|
| **Mid_Stream** | Central hub, unified frontend | `C:\Users\Chris\Mid_Stream` | https://mid-stream.vercel.app | Active |
| **Prompt Runner** | Backend API, extraction engine | `Github/prompt-runner-master` | Railway (production) | DO NOT TOUCH |
| **HITL-TCP-Project** | Requirements, prompts, docs | `HITL-TCP-Project/` | N/A (documentation) | Reference |

### Reference Projects (A360 Core)

| Project | Purpose | Location | Notes |
|---------|---------|----------|-------|
| **a360-genai-platform** | Core A360 backend | `Github/a360-genai-platform-develop` | Reference only |
| **a360-web-app** | Core A360 frontend | `Github/a360-web-app-develop` | Theme source |
| **a360-notes-ios** | iOS transcription app | `Github/a360-notes-ios-develop` | Reference only |

### Exploration/Demo Projects

| Project | Purpose | Location | Notes |
|---------|---------|----------|-------|
| **A360 BI Dashboard** | Demo dashboard (Tailwind) | `Github/A360-Business-Intelligence-Dashboard-main` | Exploration |
| **Kanban Board** | Standalone kanban demo | `Github/kanbanBoard-main` | Merged into Mid_Stream |
| **Coaching** | KPI dashboards (Radix/Tailwind) | `github.com/ccabell/Coaching` | Merged into Mid_Stream |
| **ie-interface** | Legacy extraction viewer | `github.com/ccabell/ie-interface` | Superseded by Mid_Stream |

---

## Deployment URLs

| Environment | URL | Purpose |
|-------------|-----|---------|
| **Mid_Stream (Production)** | https://mid-stream.vercel.app | Main interface |
| **Prompt Runner API** | https://prompt-runner-production.up.railway.app | Backend API |
| **Prompt Runner Admin** | https://prompt-runner-admin.vercel.app | Legacy admin UI |
| **IE Interface (Legacy)** | https://ccabell.github.io/ie-interface | Deprecated |

---

## Key Documentation

| Document | Location | Purpose |
|----------|----------|---------|
| **This File** | `Mid_Stream/docs/PROJECT_HUB.md` | Project overview |
| **TCP Master Plan** | `HITL-TCP-Project/TCP_MASTER_PLAN.md` | System roadmap |
| **V3 Extraction Schema** | `HITL-TCP-Project/prompts/V3_EXTRACTION_SCHEMA.md` | Data structures |
| **Practice Library Reqs** | `HITL-TCP-Project/requirements/03_PRACTICE_LIBRARY_REQUIREMENTS.md` | Library design |
| **Opportunities Agent Reqs** | `HITL-TCP-Project/requirements/06_OPPORTUNITIES_AND_OPPORTUNITIES_AGENT_REQUIREMENTS.md` | Agent spec |
| **GHL Campaign Guide** | `HITL-TCP-Project/docs/GHL_CAMPAIGNS_AND_PAYLOAD_GUIDE.md` | CRM integration |
| **Frontend Build Strategy** | `HITL-TCP-Project/docs/FRONTEND_BUILD_STRATEGY.md` | Build approach |

---

## Critical Rules

### 1. NEVER Touch Prompt Runner

Prompt Runner is the source of truth backend. It is:
- Deployed to Railway (production)
- Storing data in Supabase
- Serving all API endpoints

**All changes go to Mid_Stream or new sub-projects, never to Prompt Runner.**

### 2. Sub-Projects for Third Parties

When sharing with third parties:
- Create a new repo (e.g., `ccabell/client-demo`)
- Copy only the necessary components from Mid_Stream
- Configure separate Vercel deployment
- Document dependencies clearly

### 3. Documentation First

Before implementing new features:
1. Write requirements in `docs/requirements/`
2. Update this PROJECT_HUB.md
3. Create TODO items
4. Then implement

---

## Technology Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| **Frontend** | React 19, TypeScript, Vite 6 | Same as A360 web app |
| **UI Framework** | MUI v7 | Matches A360 design system |
| **State** | Zustand | Lightweight stores |
| **Routing** | React Router v7 | File-based routes |
| **Charts** | @mui/x-charts, Recharts | Data visualization |
| **Drag-Drop** | @dnd-kit | Kanban board |
| **HTTP** | Axios | API client |
| **Deployment** | Vercel | Static hosting + rewrites |

---

## Roadmap

### Phase 1: Foundation (COMPLETE)
- [x] Project setup (Vite + React 19 + TypeScript)
- [x] MUI v7 theme from A360
- [x] API layer connecting to Prompt Runner
- [x] Basic pages (Dashboard, Runs, RunDetail, Opportunities, Agents)
- [x] Agent execution from RunDetail
- [x] Vercel deployment with CORS proxy

### Phase 2: Core Features (IN PROGRESS)
- [ ] Project Hub landing page
- [ ] HITL Verification UI (from FUTURE_TCP_SYSTEM.md)
- [ ] Enhanced Run Detail with V3 schema display
- [ ] Visit checklist visualization
- [ ] Objection/hesitation/concern handling

### Phase 3: Practice Library
- [ ] View global library (concerns, anatomy, checklists)
- [ ] View practice library (CaloSpa example)
- [ ] Edit practice-specific overrides
- [ ] Suggestion rules viewer

### Phase 4: Downstream Agents
- [ ] Cross-sell guidance display
- [ ] Objection response agent
- [ ] Opportunities agent output
- [ ] GHL campaign payload preview

### Phase 5: Polish
- [ ] Loading skeletons
- [ ] Error boundaries
- [ ] Responsive design
- [ ] Accessibility audit
- [ ] Performance optimization

---

## File Structure

```
Mid_Stream/
├── docs/
│   ├── PROJECT_HUB.md          # This file
│   ├── ARCHITECTURE.md         # Technical architecture
│   └── requirements/           # Feature requirements
├── src/
│   ├── api/                    # Axios client + API modules
│   ├── components/
│   │   ├── layout/             # AppLayout, Sidebar
│   │   ├── common/             # Shared components
│   │   ├── cards/              # Extraction card components
│   │   ├── hitl/               # HITL verification components
│   │   └── kanban/             # Opportunities board
│   ├── pages/
│   │   ├── HubPage.tsx         # Project hub landing
│   │   ├── DashboardPage.tsx   # KPI dashboard
│   │   ├── RunsPage.tsx        # Run list
│   │   ├── RunDetailPage.tsx   # Extraction + agents
│   │   ├── OpportunitiesPage.tsx # Kanban board
│   │   └── AgentsPage.tsx      # Agent list
│   ├── stores/                 # Zustand stores
│   ├── hooks/                  # Custom hooks
│   ├── utils/                  # Utilities
│   └── theme/                  # MUI theme
├── vercel.json                 # Vercel config with API rewrite
└── package.json
```

---

## Quick Commands

```bash
# Development
cd C:\Users\Chris\Mid_Stream
npm run dev

# Build
npm run build

# Deploy to Vercel
npx vercel --prod --yes

# Check deployment
curl https://mid-stream.vercel.app/api/runs | head -c 200
```

---

## Contact

**Owner:** Chris Cabell
**GitHub:** ccabell
**Projects:** https://github.com/ccabell

---

*Last Updated: 2026-03-14*
