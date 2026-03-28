# Claude Code Task: Module 1 - Extraction Layer

## Context
You are building the **Extraction Module** for the Pulse project. This module is the foundation for all other intelligence features. It takes raw JSON output from the Supabase `ie_runs` table (or the `getAIoutput` API) and transforms it into structured props that exactly match the A360 Production Card System.

## Goal
Create `src/modules/extraction/` and wire it into the `ConsultationSessionProvider` and `CardsContent.tsx`.

## Step-by-Step Instructions

### Step 1: Create the Module Structure
1. Create directory: `src/modules/extraction/`
2. Create `src/modules/extraction/types.ts`.
   - Port the `V2Pass1Output`, `V2Pass2Output`, and `FieldWithEvidence` types from the `prompt-runner/ie-interface` repository (or refer to `06_Supabase_Data_Contract.md`).
3. Create `src/modules/extraction/transformer.ts`.
   - Write pure functions that take `V2Pass1Output` and `V2Pass2Output` and return props for the Card components.
   - Example: `export function buildSummaryCardProps(p2: V2Pass2Output): SummaryCardProps`
   - Example: `export function buildValueMetricsProps(p1: V2Pass1Output): { totalValue: string, commitmentLevel: number }`
4. Create `src/modules/extraction/index.ts` to export the types and transformer functions.

### Step 2: Update ConsultationSessionProvider
1. Open `src/pages/Patients/pages/ConsultationSession/ConsultationSessionProvider.tsx`.
2. The provider currently fetches `summaryAI`, `soapNotes`, etc.
3. Ensure it fetches the `summary` document type (which contains the extraction JSON) and exposes it in the context state as `extractionData`.
4. *Note: The API client `getAIoutput` returns an `AIoutputResponse<T>`. You will type `T` as `{ pass1: V2Pass1Output, pass2: V2Pass2Output }`.*

### Step 3: Wire CardsContent.tsx
1. Open `src/pages/Patients/pages/PatientConsultationProfile/TabsContent/Intelligence/CardsContent.tsx`.
2. Remove the hardcoded mock data (e.g., `80`, `$4,250`, `32 min`).
3. Consume the `extractionData` from the `ConsultationSessionContext`.
4. Pass the data through your transformer functions from Step 1.
5. Render the `SummaryCard`, `ValueAccordionCard`, `StatisticCard`, and `EvidenceCard` components using the transformed real data.

## Constraints
- **DO NOT** modify the UI components in `src/components/Card/`. You must adapt the data to fit their existing prop signatures.
- **DO NOT** use `any`. Strictly type the extraction JSON.
- If a field is missing in the JSON, provide a graceful fallback (e.g., "N/A" or hide the card).
