# Claude Code Task: Module 4 - Coaching Module

## Context
You are building the **Coaching Module** for the Pulse project. This module evaluates provider performance based on the consultation transcript and extraction data, providing actionable feedback. It must mirror the functionality currently in the `Mid_Stream` repository.

## Goal
Create `src/modules/coaching/` and implement the evaluation logic and UI, ensuring it aligns with the Global/Practice Library concept.

## Step-by-Step Instructions

### Step 1: Create the Module Structure
1. Create directory: `src/modules/coaching/`
2. Create `src/modules/coaching/types.ts`.
   - Define `CoachingEvaluation`, `ScoreCategory` (e.g., LAER method, Objection Handling, Cross-sell Effort), and `FeedbackItem`.
3. Create `src/modules/coaching/evaluator.ts`.
   - Write functions to map extraction data (specifically `patient_signals`, `objections`, and `cross_sell_effort` from Pass 2) to coaching scores.
   - **Crucial**: This logic must reference the Practice Library to determine if the provider missed suggesting a relevant product/service based on the patient's concerns.
4. Create `src/modules/coaching/index.ts`.

### Step 2: Build the UI Components
1. Create `src/modules/coaching/components/CoachingDashboard.tsx`.
   - The main container for the coaching tab.
2. Create `src/modules/coaching/components/ScoreCard.tsx`.
   - Use the `ValueAccordionCard` or `StatisticCard` from the Card System to display scores (e.g., "LAER Score: 85%").
3. Create `src/modules/coaching/components/FeedbackList.tsx`.
   - Use `AccordionCard` or `EvidenceCard` to display specific feedback items (e.g., "Missed opportunity to cross-sell Skincare for concern: Sun Damage").

### Step 3: Wire into the Application
1. Open the relevant tab component in `src/pages/Patients/pages/PatientConsultationProfile/TabsContent/`.
2. If a "Coaching" tab doesn't exist, create one.
3. Consume the `extractionData` from the `ConsultationSessionContext`, pass it through the `evaluator`, and render the `CoachingDashboard`.

## Constraints
- The evaluation logic must closely match the `Mid_Stream` implementation. Review `Mid_Stream/src/agents/` if needed for reference.
- The UI must strictly use the A360 Production Card System components.
- Ensure the module gracefully handles cases where the Practice Library data is incomplete or missing.
