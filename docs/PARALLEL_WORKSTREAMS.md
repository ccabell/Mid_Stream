# Parallel Workstream Prompts for Mid_Stream

These prompts are designed to be run in separate Claude Code windows. Each workstream is independent and won't conflict with others.

**IMPORTANT:** All work happens in `C:\Users\Chris\Mid_Stream`. Do NOT modify Prompt Runner.

---

## Workstream 1: HITL Verification Agent

**Purpose:** Build the Human-In-The-Loop verification UI that analyzes extraction output against the practice library and asks provider verification questions.

### Prompt to Copy:

```
I'm working on the Mid_Stream project at C:\Users\Chris\Mid_Stream

This is a React 19 + MUI v7 + TypeScript project that serves as a unified frontend for A360's Intelligence Extraction ecosystem. The backend is Prompt Runner (DO NOT MODIFY).

## Your Task: Build the HITL Verification Agent UI

The HITL (Human-In-The-Loop) system analyzes transcript extractions against the practice library and presents verification questions to providers before generating a TCP.

### What HITL Does:
1. Takes extraction output (from Pass 1 + Pass 2)
2. Compares offerings against practice library
3. Identifies questions/ambiguities
4. Generates verification checklist for provider

### Key Questions HITL Asks:
- **Product/Service Verification:** "Did the provider discuss [X]?"
- **Missing Items:** "Practice offers [Y] for this concern - was it mentioned?"
- **Clarification:** "[Service] was mentioned but area unclear - confirm treatment area"
- **Suggestions:** "Based on concerns, consider adding [Z] to treatment plan"

### Files to Create:
1. `src/pages/HITLPage.tsx` - Main HITL verification page
2. `src/components/hitl/VerificationChecklist.tsx` - Checklist UI
3. `src/components/hitl/SuggestionCard.tsx` - AI suggestion display
4. `src/components/hitl/OfferingVerification.tsx` - Verify each offering
5. `src/apiServices/hitl.api.ts` - HITL API calls
6. `src/stores/hitlStore/` - Zustand store (A360 pattern: store.ts, hooks.ts, selectors.ts, types.ts)

### API Endpoints (Prompt Runner):
- GET `/runs/{run_id}/hitl` - Get HITL questions for a run
- POST `/runs/{run_id}/hitl/verify` - Submit provider verification
- GET `/practice/{practice_id}/offerings` - Get practice library for matching

### Reference Documents:
- `C:\Users\Chris\Dropbox\NewCO\Intelligence Extraction\HITL-TCP-Project\prompts\HITL_VERIFICATION_PROMPT.md`
- `C:\Users\Chris\Dropbox\NewCO\Intelligence Extraction\HITL-TCP-Project\prompts\V3_EXTRACTION_SCHEMA.md`

### A360 Patterns to Follow:
- Check `C:\Users\Chris\repos\a360\a360-web-app\src` for patterns
- Zustand stores: store.ts, hooks.ts, selectors.ts, types.ts
- API services in `apiServices/` folder
- Use baseUrl imports (not @/ aliases)

### UI Requirements:
- Show extraction summary at top
- List each offering with verification checkbox
- Show AI suggestions with accept/reject buttons
- "Questions" section for clarifications
- Submit button to complete verification
- Navigate to TCP generation after approval

Start by reading the HITL verification prompt and V3 schema, then build the components.
```

---

## Workstream 2: TCP Generation Tool

**Purpose:** Build the Treatment & Care Plan generation UI that takes verified HITL data and creates a TCP based on practice library offerings.

### Prompt to Copy:

```
I'm working on the Mid_Stream project at C:\Users\Chris\Mid_Stream

This is a React 19 + MUI v7 + TypeScript project that serves as a unified frontend for A360's Intelligence Extraction ecosystem. The backend is Prompt Runner (DO NOT MODIFY).

## Your Task: Build the TCP (Treatment & Care Plan) Generation Tool

The TCP tool takes verified HITL output and generates a comprehensive treatment plan using the practice library.

### What TCP Does:
1. Takes verified extraction + HITL approvals
2. Matches to practice products/services/packages
3. Generates tiered treatment options (Good/Better/Best)
4. Creates patient-facing care plan

### TCP Components:
- **Treatment Recommendations:** Based on verified concerns + offerings
- **Package Options:** Match to practice packages when applicable
- **Pricing Tiers:** A la carte vs package comparison
- **Timeline:** Treatment sequence and follow-up schedule
- **Patient Goals:** Aligned with extracted goals

### Files to Create:
1. `src/pages/TCPPage.tsx` - Main TCP generation/view page
2. `src/components/tcp/TreatmentPlan.tsx` - Full plan display
3. `src/components/tcp/TierSelector.tsx` - Good/Better/Best selector
4. `src/components/tcp/PricingComparison.tsx` - A la carte vs package
5. `src/components/tcp/TimelineView.tsx` - Treatment timeline
6. `src/apiServices/tcp.api.ts` - TCP API calls
7. `src/stores/tcpStore/` - Zustand store (A360 pattern)

### API Endpoints (Prompt Runner):
- POST `/runs/{run_id}/tcp/generate` - Generate TCP from verified HITL
- GET `/runs/{run_id}/tcp` - Get existing TCP for a run
- PATCH `/runs/{run_id}/tcp` - Update TCP selections
- GET `/practice/{practice_id}/packages` - Get practice packages

### Reference Documents:
- `C:\Users\Chris\Dropbox\NewCO\Intelligence Extraction\HITL-TCP-Project\TCP_MASTER_PLAN.md`
- `C:\Users\Chris\Dropbox\NewCO\Intelligence Extraction\HITL-TCP-Project\requirements\00_PROJECT_REQUIREMENTS.md`
- `C:\Users\Chris\Dropbox\NewCO\A360 - CORE DOCUMENTS\Core Documents\tcp_treatment_care_plan_intelligence_engine.md`

### A360 Patterns to Follow:
- Check `C:\Users\Chris\repos\a360\a360-web-app\src` for patterns
- Zustand stores: store.ts, hooks.ts, selectors.ts, types.ts
- API services in `apiServices/` folder
- Use baseUrl imports (not @/ aliases)

### UI Requirements:
- Patient goals summary at top
- Three-tier treatment options (collapsible cards)
- Price breakdown with savings calculation
- Timeline visualization
- "Generate PDF" button
- "Send to Patient" action

Start by reading the TCP Master Plan and project requirements, then build the components.
```

---

## Workstream 3: Extraction Runner

**Purpose:** Build UI to run transcript extractions through Pass 1 and Pass 2 prompts.

### Prompt to Copy:

```
I'm working on the Mid_Stream project at C:\Users\Chris\Mid_Stream

This is a React 19 + MUI v7 + TypeScript project that serves as a unified frontend for A360's Intelligence Extraction ecosystem. The backend is Prompt Runner (DO NOT MODIFY).

## Your Task: Build the Extraction Runner UI

The Extraction Runner allows users to process transcripts through the V3 two-pass extraction system.

### What Extraction Does:
1. **Pass 1:** Extract visit context, patient goals, offerings discussed
2. **Pass 2:** Extract outcome, intelligence scores, opportunities

### Files to Create:
1. `src/pages/ExtractionPage.tsx` - Run new extractions
2. `src/components/extraction/TranscriptInput.tsx` - Paste/upload transcript
3. `src/components/extraction/ExtractionProgress.tsx` - Show extraction status
4. `src/components/extraction/ExtractionResults.tsx` - Display results
5. `src/apiServices/extraction.api.ts` - Extraction API calls

### API Endpoints (Prompt Runner):
- POST `/extract` - Run extraction on transcript
- GET `/runs/{run_id}` - Get extraction results

### Reference Documents:
- `C:\Users\Chris\Dropbox\NewCO\Intelligence Extraction\HITL-TCP-Project\prompts\V3_EXTRACTION_SCHEMA.md`
- `C:\Users\Chris\Dropbox\NewCO\Intelligence Extraction\HITL-TCP-Project\prompts\V3_PASS_1_PROMPT.md`
- `C:\Users\Chris\Dropbox\NewCO\Intelligence Extraction\HITL-TCP-Project\prompts\V3_PASS_2_PROMPT.md`

### UI Requirements:
- Large text area for transcript input
- Practice selector dropdown
- "Run Extraction" button with loading state
- Progress indicator for each pass
- Results display with V3 schema cards
- Link to HITL verification after completion

Start by reading the V3 schema and prompts, then build the components.
```

---

## Working Directory Structure

All workstreams build into these folders:
```
Mid_Stream/
├── src/
│   ├── apiServices/
│   │   ├── practiceLibrary/    # Workstream 0 (this chat)
│   │   ├── hitl.api.ts         # Workstream 1
│   │   ├── tcp.api.ts          # Workstream 2
│   │   └── extraction.api.ts   # Workstream 3
│   ├── components/
│   │   ├── practiceLibrary/    # Workstream 0
│   │   ├── hitl/               # Workstream 1
│   │   ├── tcp/                # Workstream 2
│   │   └── extraction/         # Workstream 3
│   ├── pages/
│   │   ├── PracticeLibraryPage.tsx    # Workstream 0
│   │   ├── HITLPage.tsx               # Workstream 1
│   │   ├── TCPPage.tsx                # Workstream 2
│   │   └── ExtractionPage.tsx         # Workstream 3
│   └── stores/
│       ├── practiceLibraryStore/      # Workstream 0
│       ├── hitlStore/                 # Workstream 1
│       └── tcpStore/                  # Workstream 2
```

## Git Workflow

Each workstream should:
1. Work on its own feature files
2. Commit frequently with clear messages
3. Avoid modifying shared files (App.tsx, routes, etc.) - those will be merged later

---

## Coordination Notes

- **This chat (Workstream 0)** handles Practice Library Manager and route integration
- Other workstreams build isolated components
- After all workstreams complete, we'll integrate routes and navigation
