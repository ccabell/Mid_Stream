# Mid_Stream — Todo & Backlog

> Last updated: Round 21 (2026-03-29)

---

## ✅ Closed in Round 21

### pl_services / pl_products procedures (Round 18 backlog item)
**Status: CLOSED**

The `pl_services` and `pl_products` tRPC procedures were scaffolded in Round 18 but the
actual practice data lives in `ie_practice_library_files` (surfaced in the Library Files sub-tab).

**Resolution:**
- Both `pl_services` and `pl_products` Supabase tables exist with the correct schema but
  are currently empty (0 rows) — this is expected since practices haven't populated them yet.
- The `useServices` and `useProducts` hooks in `practiceLibraryStore/hooks.ts` now query
  Supabase directly (`pl_services` / `pl_products`) for practice-specific data instead of
  the old localStorage stub.
- When a practice has no services/products yet, the tabs show a friendly empty state with
  a "No services configured yet" / "No products configured yet" message.
- Global Library mode continues to use the static `globalLibraryFromSupabase.ts` data
  (126 services, 359 products from `gl_services` / `gl_products`).
- The `supabase` client is now available at `src/lib/supabaseClient.ts` for future use.

---

## ✅ Closed in Round 21

### CoachingPage — new dedicated coaching view
**Status: COMPLETE**

Added a new `/coaching` route and `CoachingPage` that:
- Lists all extraction runs with their downstream agent outputs
- Shows coaching agent results (cross-sell guidance, opportunity signals) per run
- Allows triggering downstream coaching agents from the run list
- Sidebar nav entry: "Coaching" with Psychology icon

Files added/modified:
- `src/pages/CoachingPage.tsx` — new page
- `src/constants/routes.ts` — added `COACHING: '/coaching'`
- `src/pages/index.ts` — exported `CoachingPage`
- `src/App.tsx` — added route
- `src/components/layout/Sidebar.tsx` — added nav item

---

## ✅ Closed in Round 21

### @mui/system missing dependency
**Status: FIXED**

Pre-existing build error in `src/agents/tcp-runner/components/SectionProgress.tsx` and
`StreamingText.tsx` — both imported `keyframes` from `@mui/system` which wasn't installed.
Added `@mui/system@7.3.9` to dependencies.

---

## 🔲 Open Items — Round 22 Backlog

### 1. Practice Services/Products — populate pl_ tables
The `pl_services` and `pl_products` Supabase tables are currently empty. Once practices
configure their service/product lists, the Library tabs will automatically display them.
A future round should add a UI for practice admins to add/edit their services and products
(write path to Supabase `pl_services` / `pl_products`).

### 2. CoachingPage — run coaching agent trigger
The CoachingPage displays existing downstream agent outputs but the "Run Coaching Agent"
button needs to be wired to the `agentsApi.runDownstream()` call with proper loading/error
states and result refresh.

### 3. LLM Eval page — connect to live eval runs
The `EvalTesterPage` has the Sync to Prompt Runner feature but the LLM Eval tab in the
sidebar is a placeholder. Wire it to actual eval run history from Supabase.

### 4. Opportunities page — Kanban persistence
The Opportunities Kanban board uses local state. Wire drag-and-drop state changes to
Supabase `ie_opportunities` table updates.

### 5. Dashboard KPIs — live data
Dashboard currently shows static/mock KPI data. Wire to real aggregations from
`ie_runs` and `ie_opportunities` tables.

### 6. Chunk size warning
The production bundle is 2.2 MB (593 KB gzipped). Consider code-splitting with
`React.lazy()` for heavy pages (TCP Runner, Eval Tester, Library) to improve initial load.

---

## Key Conventions (do not change)

- All Prompt Runner catalog writes use slug prefix `midstream-{practiceSlug}` to avoid
  namespace collisions with other projects (e.g., Pulse).
- All tests live in `server/*.test.ts`; run with `pnpm test`. Currently 65 tests passing.
- No DELETE calls to Prompt Runner anywhere in the codebase.
- Static assets go to `/home/ubuntu/webdev-static-assets/` and are served via CDN URL
  (never stored in `client/public/`).
- Supabase client: `src/lib/supabaseClient.ts` — anon key, read-only, RLS enforced.
- Deployment: `git push origin master` → Vercel auto-deploys from master branch.
- Live URL: https://midstream-kegfdzzz.manus.space
