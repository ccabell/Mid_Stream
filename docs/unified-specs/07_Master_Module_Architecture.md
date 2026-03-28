# Master Module Architecture Spec

## 1. Core Philosophy: The Module System
Both `Mid_Stream` and `Pulse` will share a unified module architecture. 
- **Mid_Stream** is the proving ground (build, test, iterate).
- **Pulse** is the production mirror (simplified, robust, aligned with A360 UI).

All new features must be built as self-contained **Modules** inside `src/modules/`.

### The 4 Core Modules
1. **Extraction Module**: Transforms raw Supabase JSON into structured props for the Card System.
2. **Opportunity Tracking Module**: Identifies, tracks, and manages commercial opportunities (upsells, cross-sells) extracted from consultations.
3. **Agent Runner Module**: Allows running specific AI agents against extraction data to generate new insights or content.
4. **Coaching Module**: Evaluates provider performance (e.g., LAER method, objection handling) and provides actionable feedback, mirroring the Mid_Stream implementation.

---

## 2. The Global & Practice Library Concept
The system is moving away from the legacy "Prompt Runner Practice Library" to a unified **Global & Practice Library** model.

### Global Library
- The master catalog of all possible products, services, and treatments (e.g., Neurotoxins, Dermal Fillers).
- Standardized schemas (e.g., `GlobalService`, `GlobalProduct`).
- Maintained at the platform level.

### Practice Library
- A practice's specific implementation of the Global Library.
- Practices "adopt" items from the Global Library and customize them (pricing, specific brand names, provider preferences).
- **Crucial Data Flow**: The Extraction Module and Coaching Module *must* reference the Practice Library to understand what a specific practice actually offers and how they handle objections.

---

## 3. Module 1: Extraction Layer (The Foundation)
**Goal**: Connect raw Supabase extraction JSON to the A360 Production Card System.

### Architecture
`src/modules/extraction/`
- `types.ts`: Canonical types (`V2Pass1Output`, `V2Pass2Output`, `FieldWithEvidence`).
- `transformer.ts`: Pure functions that map `V2PassXOutput` to specific Card Props (e.g., `SummaryCardProps`, `EvidenceCardProps`).
- `index.ts`: Public API for the module.

### Integration Point
- `ConsultationSessionProvider.tsx` fetches the raw JSON via `getAIoutput`.
- `CardsContent.tsx` consumes the transformer output and renders the UI components.

---

## 4. Module 2: Opportunity Tracking
**Goal**: Surface commercial opportunities identified during the consultation.

### Architecture
`src/modules/opportunities/`
- `types.ts`: `Opportunity` interface (stage, value, blurb, disposition).
- `extractor.ts`: Logic to parse `recommended_receptive`, `recommended_hesitant`, and `discussed` items from the Extraction Layer.
- `components/`: `OpportunityBoard` (Kanban style) and `OpportunityCard`.

### Integration Point
- Fed by the Extraction Layer's `offerings` data.
- Displayed in a dedicated "Opportunities" tab or section within the Consultation Profile.

---

## 5. Module 3: Agent Runner
**Goal**: Execute specialized AI agents on demand using the consultation context.

### Architecture
`src/modules/agent-runner/`
- `types.ts`: `AgentDefinition`, `AgentRunRequest`, `AgentRunResult`.
- `api.ts`: Client for triggering agent runs via the backend.
- `components/`: `AgentSelector`, `RunStatusIndicator`, `ResultRenderer`.

### Integration Point
- Uses the `ConsultationSession` context as the base prompt payload.
- Outputs are rendered using the shared Card System.

---

## 6. Module 4: Coaching Module
**Goal**: Evaluate provider performance and provide feedback, exactly mirroring Mid_Stream.

### Architecture
`src/modules/coaching/`
- `types.ts`: `CoachingEvaluation`, `ScoreCategory`, `FeedbackItem`.
- `evaluator.ts`: Logic to map extraction data (e.g., objection handling, cross-sell effort) to coaching scores.
- `components/`: `CoachingDashboard`, `ScoreCard`, `FeedbackList`.

### Integration Point
- Relies heavily on the Practice Library (to know *what* should have been suggested).
- Consumes data from the Extraction Layer (specifically `patient_signals` and `objections`).
- Displayed in a dedicated "Coaching" tab.

---

## 7. The Card System (UI Layer)
The Card System is the universal display layer for all modules. It **must** strictly adhere to the A360 production UI components found in `pulse/src/components/Card/`.

### Core Components
- `SummaryCard`: For general text and grouped information.
- `EvidenceCard`: For items requiring a score and a snippet/quote.
- `StatisticCard`: For single metric display (e.g., Total Value).
- `ValueAccordionCard`: For metrics with drill-down details.
- `AccordionCard`: For expandable lists (e.g., Objections, Next Steps).

### Rule of Thumb
**Never build a custom UI component if a Card System component can be used.** All module outputs must be transformed into Card Props.
