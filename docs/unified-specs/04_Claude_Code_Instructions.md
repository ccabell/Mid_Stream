# Claude Code Instructions: Implementing the Unified Specs

## Overview
This document provides specific instructions for Claude Code to execute the unified spec-driven development plan. The goal is to build simplified versions of Mid_Stream functionality into the A360 Pulse environment, specifically focusing on the Extraction Module and the Card System.

## General Rules for Claude Code
1.  **Read Specs First**: Before writing any code, you MUST read the relevant specification documents located in `docs/unified-specs/`.
2.  **Local Commits Only**: When developing tools or features where the immediate goal is testing, commit code locally. Do not push to remote repositories unless explicitly instructed.
3.  **Maintain Baselines**: When creating a new version of an existing functional system (like the Card System), ensure the original remains accessible for comparison if needed.
4.  **Follow the Shared Module Architecture**: Understand that Mid_Stream is the prototype environment and Pulse is the production environment. Code ported to Pulse should be simplified and robust.

## Task 1: Implement the Simplified Extraction Module in Pulse
**Reference**: `02_Extraction_Module_Spec.md`

1.  **Create Types**: Create `src/modules/extraction/types.ts` in the Pulse repository. Define the `SimplifiedExtractionOutput` interface as specified.
2.  **Create Transformer**: Create `src/modules/extraction/transformer.ts`. 
    *   Review the complex unwrap logic in Mid_Stream (`src/agents/hitl/utils/transformExtraction.ts`).
    *   Implement a simplified `transformRawExtractionToSimplified` function that safely extracts data from the raw Supabase JSON into the `SimplifiedExtractionOutput` format.
3.  **Integrate with State**: Modify `src/pages/Patients/pages/ConsultationSession/ConsultationSessionProvider.tsx` to use the transformer when AI attachment data (like `summaryAI` or `entities`) is fetched, storing the clean, structured data in the context state.

## Task 2: Connect Extraction Data to the Card System in Pulse
**Reference**: `03_Card_System_Spec.md`

1.  **Create Mapper**: Create `src/modules/cards/mapper.tsx` in the Pulse repository.
    *   Implement the `mapExtractionToCards` function.
    *   This function must take a `SimplifiedExtractionOutput` object and return an array of `CardConfig` objects (containing IDs and React Nodes).
    *   Use the existing `SummaryCard`, `AccordionCard`, and `EvidenceCard` components from `src/components/Card/`.
2.  **Update UI**: Create or update a component (e.g., `ExtractionResults.tsx` or modify `SummaryContent.tsx`) to consume the mapped cards.
    *   Retrieve the transformed extraction data from the context.
    *   Pass it through the mapper.
    *   Render the resulting cards in a responsive Grid layout.

## Task 3: Prototyping New Cards (If Required)
If the user requests a new type of card (e.g., an Objection Card):
1.  **Build in Mid_Stream**: Create the component in Mid_Stream first. Test it with complex mock data and ensure it handles edge cases.
2.  **Port to Pulse**: Once approved, copy the component to Pulse's `src/components/Card/` directory, simplifying the props and logic as necessary to fit the Pulse architecture.
