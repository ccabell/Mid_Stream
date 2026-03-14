# Mid_Stream

**Unified Intelligence Extraction Frontend for A360**

Mid_Stream is the central hub for viewing, managing, and interacting with consultation intelligence data extracted by the Prompt Runner backend.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to Vercel
npx vercel --prod --yes
```

## Live Deployment

- **Production:** https://mid-stream.vercel.app
- **Backend API:** https://prompt-runner-production.up.railway.app (DO NOT MODIFY)

## Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Dashboard** | KPI overview with charts | Complete |
| **Runs** | List all extraction runs | Complete |
| **Run Detail** | View extraction outputs + run agents | Complete |
| **Opportunities** | Kanban board for follow-up tracking | Complete |
| **Agents** | List available downstream agents | Complete |
| **HITL Verification** | Provider review/approval screen | Planned |
| **Practice Library** | View/edit practice configurations | Planned |

## Architecture

```
Mid_Stream (React/Vercel)
    │
    │ /api/* → rewritten to backend
    ▼
Prompt Runner (FastAPI/Railway)
    │
    ▼
Supabase (PostgreSQL)
```

## Documentation

- [Project Hub](docs/PROJECT_HUB.md) - Complete project overview and inventory
- [HITL-TCP Requirements](../HITL-TCP-Project/) - Feature requirements and schemas

## Key Files

```
src/
├── api/           # API client and typed endpoints
├── components/    # Reusable UI components
├── pages/         # Route pages
├── theme/         # MUI v7 theme (A360 design system)
└── constants/     # Routes and configuration
```

## Environment

Local development uses Vite proxy. Production uses Vercel rewrites defined in `vercel.json`.

## Related Projects

| Project | Purpose | Touch? |
|---------|---------|--------|
| Prompt Runner | Backend API | NO |
| HITL-TCP-Project | Requirements/docs | Reference |
| Coaching | Legacy (merged) | Archived |
| ie-interface | Legacy (superseded) | Archived |

---

*Part of the A360 Intelligence Extraction ecosystem*
