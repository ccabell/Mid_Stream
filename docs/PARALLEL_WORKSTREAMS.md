# Parallel Workstream Prompts for Mid_Stream

These prompts are designed to be run in separate Claude Code windows. Each workstream is independent and won't conflict with others.

**IMPORTANT:**
- All work happens in `C:\Users\Chris\Mid_Stream`
- Do NOT modify Prompt Runner backend
- All agents must implement `AgentModule` interface from `src/agents/types.ts`
- Register agents in `src/agents/registry.ts`
- Read `docs/AGENT_SETUP_GUIDE.md` before starting

---

## Workstream 1: HITL Verification Agent

**Purpose:** Build the Human-In-The-Loop verification agent that analyzes extraction output against the practice library and asks provider verification questions.

**Agent ID:** `hitl_verification`
**Input Type:** `extraction_output`
**Output Type:** `HITLVerifiedOutput` (defined in `src/agents/types.ts`)
**Category:** `verification`

### Prompt to Copy:

```
## Context Header
First, read and follow this context header:
C:\Users\Chris\Dropbox\NewCO\Intelligence Extraction\CHAT_PROMPTS\CONTEXT_HEADER.md

## Your Task: Build the HITL Verification Agent

I'm working on the Mid_Stream project at C:\Users\Chris\Mid_Stream

Build the HITL (Human-In-The-Loop) verification agent. This agent:
1. Takes extraction output (from Pass 1 + Pass 2)
2. Compares offerings against practice library
3. Identifies questions/ambiguities
4. Generates verification checklist for provider
5. Outputs HITLVerifiedOutput for TCP agent

### Agent Interface

Your agent MUST implement the AgentModule interface. Start by reading:
- `src/agents/types.ts` - All shared interfaces
- `docs/AGENT_SETUP_GUIDE.md` - Step-by-step instructions

### Files to Create:

```
src/agents/hitl/
├── index.ts                    # Exports hitlAgent: AgentModule
├── HITLPage.tsx               # Main page component (AgentPageProps)
├── components/
│   ├── VerificationChecklist.tsx
│   ├── SuggestionCard.tsx
│   ├── OfferingVerification.tsx
│   ├── PatientSummary.tsx
│   └── index.ts
├── hooks/
│   ├── useHITLState.ts
│   └── index.ts
├── utils/
│   ├── matchOfferings.ts      # Match extraction to practice library
│   └── index.ts
└── README.md
```

### Agent Definition:

```typescript
export const hitlAgent: AgentModule = {
  id: 'hitl_verification',
  name: 'HITL Verification',
  description: 'Provider verification of extraction output',
  version: '1.0.0',
  inputType: 'extraction_output',
  requiredFields: ['prompt_1', 'prompt_2'],
  capabilities: {
    canRunStandalone: false,
    canRunFromRunDetail: true,
    canBeShared: false,
    requiresPracticeLibrary: true,
    chainableOutputs: ['tcp_generator'],
  },
  category: 'verification',
  icon: 'FactCheck',
  Page: HITLPage,
};
```

### HITL Verification Questions:
- **Product/Service Verification:** "Did the provider discuss [X]?"
- **Missing Items:** "Practice offers [Y] for this concern - was it mentioned?"
- **Clarification:** "[Service] was mentioned but area unclear - confirm treatment area"
- **Suggestions:** "Based on concerns, consider adding [Z] to treatment plan"

### Output Structure (HITLVerifiedOutput):
Use the type defined in `src/agents/types.ts` - includes:
- patient_summary (primary_concern, goals, timeline)
- todays_treatments (VerifiedTreatment[])
- recommendations (VerifiedRecommendation[])
- needs_attention (objections, hesitations, concerns)
- checklist (completion_rate, items)
- settings (TCPSettings)

### Access Practice Library:

```typescript
import { usePracticeLibraryStore } from 'stores';

const services = usePracticeLibraryStore(state => state.services);
const products = usePracticeLibraryStore(state => state.products);
```

### Reference Documents:
- `C:\Users\Chris\Dropbox\NewCO\Intelligence Extraction\HITL-TCP-Project\prompts\HITL_VERIFICATION_PROMPT.md`
- `C:\Users\Chris\Dropbox\NewCO\Intelligence Extraction\HITL-TCP-Project\prompts\V3_EXTRACTION_SCHEMA.md`

### After Building:
1. Register in `src/agents/registry.ts`
2. Test with mock extraction data
3. Verify HITLVerifiedOutput matches type definition
```

---

## Workstream 2: TCP Generation Agent

**Purpose:** Build the Treatment & Care Plan generation agent that takes verified HITL data and creates a TCP.

**Agent ID:** `tcp_generator`
**Input Type:** `hitl_verified`
**Output Type:** `tcp_output` (TCP document)
**Category:** `generation`

### Prompt to Copy:

```
## Context Header
First, read and follow this context header:
C:\Users\Chris\Dropbox\NewCO\Intelligence Extraction\CHAT_PROMPTS\CONTEXT_HEADER.md

## Your Task: Build the TCP Generation Agent

I'm working on the Mid_Stream project at C:\Users\Chris\Mid_Stream

Build the TCP (Treatment & Care Plan) generation agent. This agent:
1. Takes HITLVerifiedOutput (from HITL agent)
2. Matches verified items to practice products/services/packages
3. Generates tiered treatment options (Good/Better/Best)
4. Creates patient-facing care plan with pricing

### Agent Interface

Your agent MUST implement the AgentModule interface. Start by reading:
- `src/agents/types.ts` - All shared interfaces
- `docs/AGENT_SETUP_GUIDE.md` - Step-by-step instructions

### Files to Create:

```
src/agents/tcp/
├── index.ts                    # Exports tcpAgent: AgentModule
├── TCPPage.tsx                # Main page component (AgentPageProps)
├── components/
│   ├── TreatmentPlan.tsx
│   ├── TierSelector.tsx       # Good/Better/Best
│   ├── PricingComparison.tsx  # A la carte vs package
│   ├── TimelineView.tsx
│   ├── GoalsSummary.tsx
│   └── index.ts
├── hooks/
│   ├── useTCPGeneration.ts
│   └── index.ts
├── utils/
│   ├── calculatePricing.ts
│   ├── generateTiers.ts
│   └── index.ts
└── README.md
```

### Agent Definition:

```typescript
export const tcpAgent: AgentModule = {
  id: 'tcp_generator',
  name: 'TCP Generator',
  description: 'Generate Treatment & Care Plans from verified data',
  version: '1.0.0',
  inputType: 'hitl_verified',
  requiredFields: ['todays_treatments', 'recommendations', 'settings'],
  capabilities: {
    canRunStandalone: false,
    canRunFromRunDetail: true,
    canBeShared: true,  // Can be exported as standalone app
    requiresPracticeLibrary: true,
  },
  category: 'generation',
  icon: 'Description',
  Page: TCPPage,
};
```

### TCP Components:
- **Treatment Recommendations:** Based on verified concerns + offerings
- **Package Options:** Match to practice packages when applicable
- **Pricing Tiers:** A la carte vs package comparison with savings
- **Timeline:** Treatment sequence and follow-up schedule
- **Patient Goals:** Aligned with extracted and verified goals

### Input (HITLVerifiedOutput):
Your agent receives `hitlOutput` prop. Key fields:
- `todays_treatments` - What was performed/scheduled
- `recommendations` - What to recommend
- `patient_summary` - Goals, concerns, timeline
- `settings` - Language, pricing, format preferences

### Access Practice Library:

```typescript
import { usePracticeLibraryStore } from 'stores';

const packages = usePracticeLibraryStore(state => state.packages);
const services = usePracticeLibraryStore(state => state.services);
```

### Reference Documents:
- `C:\Users\Chris\Dropbox\NewCO\Intelligence Extraction\HITL-TCP-Project\TCP_MASTER_PLAN.md`
- `C:\Users\Chris\Dropbox\NewCO\Intelligence Extraction\HITL-TCP-Project\requirements\00_PROJECT_REQUIREMENTS.md`
- `C:\Users\Chris\Dropbox\NewCO\A360 - CORE DOCUMENTS\Core Documents\tcp_treatment_care_plan_intelligence_engine.md`

### UI Requirements:
- Patient goals summary at top
- Three-tier treatment options (collapsible cards)
- Price breakdown with savings calculation
- Timeline visualization
- "Generate PDF" button
- "Send to Patient" action

### After Building:
1. Register in `src/agents/registry.ts`
2. Test with mock HITLVerifiedOutput
3. Verify pricing calculations
```

---

## Workstream 3: Extraction Runner Agent

**Purpose:** Build agent to run transcript extractions through Pass 1 and Pass 2 prompts.

**Agent ID:** `extraction_runner`
**Input Type:** `custom` (raw transcript)
**Output Type:** `extraction_output`
**Category:** `extraction`

### Prompt to Copy:

```
## Context Header
First, read and follow this context header:
C:\Users\Chris\Dropbox\NewCO\Intelligence Extraction\CHAT_PROMPTS\CONTEXT_HEADER.md

## Your Task: Build the Extraction Runner Agent

I'm working on the Mid_Stream project at C:\Users\Chris\Mid_Stream

Build the Extraction Runner agent. This agent:
1. Accepts raw transcript text
2. Runs V3 two-pass extraction (Pass 1 + Pass 2)
3. Displays results using extraction cards
4. Outputs ExtractionOutput for HITL agent

### Agent Interface

Your agent MUST implement the AgentModule interface. Start by reading:
- `src/agents/types.ts` - All shared interfaces (includes Pass1Output, Pass2Output)
- `docs/AGENT_SETUP_GUIDE.md` - Step-by-step instructions

### Files to Create:

```
src/agents/extraction_runner/
├── index.ts                       # Exports extractionAgent: AgentModule
├── ExtractionRunnerPage.tsx      # Main page component
├── components/
│   ├── TranscriptInput.tsx       # Text area for transcript
│   ├── ExtractionProgress.tsx    # Pass 1/2 progress
│   ├── ExtractionResults.tsx     # Display results
│   ├── PassCard.tsx              # Individual pass result
│   └── index.ts
├── hooks/
│   ├── useExtractionRunner.ts
│   └── index.ts
└── README.md
```

### Agent Definition:

```typescript
export const extractionAgent: AgentModule = {
  id: 'extraction_runner',
  name: 'Extraction Runner',
  description: 'Run V3 extraction on transcripts',
  version: '1.0.0',
  inputType: 'custom',
  requiredFields: [],  // Takes raw transcript
  capabilities: {
    canRunStandalone: true,  // Can run from /agents/extraction_runner
    canRunFromRunDetail: false,
    canBeShared: false,
    chainableOutputs: ['hitl_verification'],
  },
  category: 'extraction',
  icon: 'Psychology',
  Page: ExtractionRunnerPage,
};
```

### Extraction Passes:

**Pass 1 Output:**
- visit_context (visit_type, reason, referred_by, motivating_event)
- patient_goals (primary_concern, secondary_concerns, goals)
- areas (treatment_areas, concern_areas)
- interests (stated_interests, future_interests)
- offerings (name, type, disposition, area, value)

**Pass 2 Output:**
- outcome (status, summary)
- next_steps (action, timeframe, owner)
- patient_signals (commitment_level)
- objections, hesitations, concerns
- visit_checklist

### API Endpoints (Prompt Runner - DO NOT MODIFY):
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
- Results display with V3 schema sections
- "Continue to HITL" button after completion

### After Building:
1. Register in `src/agents/registry.ts`
2. Test with sample transcript
3. Verify output matches ExtractionOutput type
```

---

## Agent Directory Structure

All agents follow this pattern:
```
Mid_Stream/src/agents/
├── types.ts                    # Shared interfaces (DO NOT MODIFY)
├── registry.ts                 # Agent registration (ADD YOUR AGENT)
├── hitl/                       # Workstream 1
│   ├── index.ts
│   ├── HITLPage.tsx
│   ├── components/
│   ├── hooks/
│   └── README.md
├── tcp/                        # Workstream 2
│   ├── index.ts
│   ├── TCPPage.tsx
│   ├── components/
│   ├── hooks/
│   └── README.md
└── extraction_runner/          # Workstream 3
    ├── index.ts
    ├── ExtractionRunnerPage.tsx
    ├── components/
    ├── hooks/
    └── README.md
```

---

## Data Flow

```
┌────────────────────┐
│  Raw Transcript    │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Extraction Runner  │ ← Workstream 3
│ (extraction_output)│
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐    ┌────────────────────┐
│ HITL Verification  │◄───│ Practice Library   │
│ (hitl_verified)    │    │ (services, etc.)   │
└─────────┬──────────┘    └────────────────────┘
          │                         ▲
          ▼                         │
┌────────────────────┐              │
│  TCP Generator     │──────────────┘
│  (tcp_output)      │ ← Workstream 2
└────────────────────┘
```

---

## Git Workflow

Each workstream should:
1. Work ONLY in its `src/agents/[agent-name]/` folder
2. Update `src/agents/registry.ts` to register the agent
3. Commit frequently with clear messages
4. Avoid modifying other shared files

---

## Coordination Notes

- **Workstream 0 (This Chat):** Practice Library Manager and coordination
- **Workstream 1:** HITL Verification Agent
- **Workstream 2:** TCP Generation Agent
- **Workstream 3:** Extraction Runner Agent

All agents consume data from:
- Runs API (extraction output)
- Practice Library (via Zustand store)

After all agents complete, we'll:
1. Add agent routes to App.tsx
2. Add agent links to Sidebar
3. Wire up agent chaining
