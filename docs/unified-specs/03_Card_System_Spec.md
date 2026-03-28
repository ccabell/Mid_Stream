# Specification: Card System Module

## 1. Purpose
The Card System is a modular UI framework designed to display complex, structured data (specifically the output from the Extraction Module) in a clean, digestible, and interactive format. It is the primary way users will interact with AI-generated insights in A360 Pulse.

## 2. Current State in Pulse
Pulse already has a foundational Card System located in `src/components/Card/` and a demonstration page at `src/pages/CardList/CardList.tsx`. 

The current components include:
*   `SummaryCard`: For displaying simple text blocks with an icon and title.
*   `AccordionCard`: For displaying collapsible content, often with a score/value and an info icon.
*   `EvidenceCard`: For displaying specific snippets of text (evidence) with an associated score.

## 3. The Goal: Connecting Extraction to Cards
The objective is to dynamically generate these cards based on the `SimplifiedExtractionOutput` rather than using hardcoded mock data.

## 4. Implementation Plan for Pulse

### 4.1. Create a Card Mapper Utility
We need a utility that takes the `SimplifiedExtractionOutput` and maps it to the props required by the Card components.
*   **Location**: `src/modules/cards/mapper.ts`

```typescript
import { SimplifiedExtractionOutput } from '../extraction/types';
import { ReactNode } from 'react';

export interface CardConfig {
  id: string;
  node: ReactNode;
}

export function mapExtractionToCards(data: SimplifiedExtractionOutput): CardConfig[] {
  const cards: CardConfig[] = [];

  // 1. Map Patient Goals to a Summary Card
  if (data.patientGoals.primaryConcern) {
    cards.push({
      id: 'summary-goals',
      node: <SummaryCard title="Primary Concern">{data.patientGoals.primaryConcern}</SummaryCard>
    });
  }

  // 2. Map Treatment Plan to an Accordion Card
  if (data.treatmentPlan.recommendedTreatments.length > 0) {
    cards.push({
      id: 'accordion-treatment',
      node: (
        <AccordionCard title="Treatment Plan" value={data.treatmentPlan.clarityScore}>
           {/* Map treatments to list items here */}
        </AccordionCard>
      )
    });
  }

  return cards;
}
```

### 4.2. Update the UI Component
Update the component that displays the consultation summary (e.g., `SummaryContent.tsx` or a new `ExtractionResults.tsx` component) to use this mapper.

1.  Retrieve the transformed extraction data from the `ConsultationSessionContext`.
2.  Pass the data through `mapExtractionToCards()`.
3.  Render the resulting array of `CardConfig` objects in a Grid layout, similar to how `CardList.tsx` currently operates.

## 5. Mid_Stream Prototyping
If new card types are needed (e.g., an `ObjectionCard` with specific icons for price, timing, etc., as defined in Mid_Stream's `OBJECTION_ICONS`), they should be built and tested in Mid_Stream first. Once the UI and data binding are stable, the component code should be copied over to Pulse's `src/components/Card/` directory.
