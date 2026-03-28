# Claude Code Task: Module 2 - Opportunity Tracking

## Context
You are building the **Opportunity Tracking Module** for the Pulse project. This module surfaces commercial opportunities (upsells, cross-sells, future interests) identified during the consultation. It relies on the Extraction Module's data.

## Goal
Create `src/modules/opportunities/` and implement the logic to extract and display opportunities.

## Step-by-Step Instructions

### Step 1: Create the Module Structure
1. Create directory: `src/modules/opportunities/`
2. Create `src/modules/opportunities/types.ts`.
   - Define the `Opportunity` interface (e.g., `id`, `name`, `blurb`, `value`, `stage`, `disposition`).
3. Create `src/modules/opportunities/extractor.ts`.
   - Write a function `extractOpportunities(p1: V2Pass1Output): Opportunity[]`.
   - Logic: Filter the `offerings` array from Pass 1 for items with dispositions like `recommended_receptive`, `recommended_hesitant`, or `discussed`.
   - Also check `patient_goals.future_interests` for potential long-term opportunities.
4. Create `src/modules/opportunities/index.ts` to export the types and extractor.

### Step 2: Build the UI Components
1. Create `src/modules/opportunities/components/OpportunityBoard.tsx`.
   - This should be a Kanban-style board or a structured list grouping opportunities by stage (e.g., "High Intent", "Nurture").
   - Use the existing Card System components (e.g., `EvidenceCard` or `SummaryCard`) to display individual opportunities.
2. Ensure the UI matches the A360 production design language.

### Step 3: Wire into the Application
1. Open the relevant tab component in `src/pages/Patients/pages/PatientConsultationProfile/TabsContent/`.
2. If an "Opportunities" tab doesn't exist, create one or integrate the `OpportunityBoard` into the "Intelligence" tab.
3. Consume the `extractionData` from the `ConsultationSessionContext`, pass it through `extractOpportunities`, and render the board.

## Constraints
- **DO NOT** duplicate extraction types; import them from `src/modules/extraction/types.ts`.
- Ensure all monetary values are formatted correctly (e.g., `$4,250`).
- If there are no opportunities, display a clear, styled empty state.
