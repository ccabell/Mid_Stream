# Specification: Extraction Module

## 1. Purpose
The Extraction Module is responsible for taking raw, unstructured AI outputs (typically JSON generated from consultation transcripts) and transforming them into a structured, strongly-typed format that the UI can reliably consume. 

## 2. Mid_Stream Implementation (The Prototype)
In Mid_Stream, the extraction logic is complex because it handles multiple versions of AI output (e.g., V2 with `FieldWithEvidence` wrappers vs. legacy formats) and prepares data for the Human-in-the-Loop (HITL) verification screen.

*   **Location**: `src/agents/hitl/utils/transformExtraction.ts`
*   **Key Types**: `ExtractionOutput`, `Pass1Output`, `Pass2Output`, `V2Pass1Output` (located in `src/agents/types.ts` and `src/apiServices/types.ts`).
*   **Core Functionality**: The `unwrap` and `unwrapArray` functions strip away evidence metadata to provide clean strings and arrays for the UI, while preserving the evidence for specific "Verifiable Fields".

## 3. A360 Pulse Implementation (The Simplified Version)
In Pulse, the Extraction Module needs to be a streamlined version of the Mid_Stream prototype. It does not need the full HITL editing capabilities, but it *does* need to parse the data so it can be displayed on the Card System.

### 3.1. Data Source
Pulse will receive the extraction data from Supabase via the `apiServices` layer. The data will likely arrive as an `AIoutputResponse` attached to a `ConsultationSession`.

### 3.2. Required Types (To be added to Pulse)
Pulse needs a simplified version of the Mid_Stream types. Create a new file in Pulse: `src/modules/extraction/types.ts`.

```typescript
export interface SimplifiedExtractionOutput {
  visitContext: {
    visitType: string;
    reasonForVisit: string;
  };
  patientGoals: {
    primaryConcern: string;
    secondaryConcerns: string[];
  };
  treatmentPlan: {
    recommendedTreatments: string[];
    clarityScore: number; // Derived from Pass 2 evaluation
  };
  patientEngagement: {
    score: number;
    objections: string[];
  };
}
```

### 3.3. Transformer Utility
Create a transformer function in Pulse: `src/modules/extraction/transformer.ts`. This function will take the raw Supabase JSON and map it to the `SimplifiedExtractionOutput`.

```typescript
export function transformRawExtractionToSimplified(rawJson: any): SimplifiedExtractionOutput {
  // 1. Safely unwrap fields (borrowing the unwrap logic from Mid_Stream)
  // 2. Map Pass 1 data (Goals, Context)
  // 3. Map Pass 2 data (Scores, Objections)
  // 4. Return the clean object
}
```

## 4. Integration Point
The `ConsultationSessionProvider` in Pulse (`src/pages/Patients/pages/ConsultationSession/ConsultationSessionProvider.tsx`) should utilize this transformer when it fetches the `entities` or `summaryAI` attachments, storing the *transformed* data in state, ready to be passed to the Card System.
