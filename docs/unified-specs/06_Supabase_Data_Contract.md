# Specification: Supabase Data Contract for Pulse

## 1. Purpose
This document defines the expected shape of data coming from the Supabase database into A360 Pulse. It serves as the contract between the backend (Supabase) and the frontend (Pulse), ensuring the Extraction Module transformer and other data consumers know exactly what to expect.

## 2. Key Tables (Pulse Supabase Project)
Based on the Pulse Supabase schema, the following tables are relevant to the current sprint:

| Table | Purpose |
|---|---|
| `patients` | Core patient demographic data |
| `consultation_sessions` | One record per consultation visit |
| `ai_outputs` / `ai_attachments` | Stores the raw AI-generated JSON for each session |

## 3. AI Output JSON Shape
The AI output stored in Supabase mirrors the extraction format used in Mid_Stream. The transformer must handle the following structure:

### 3.1. Pass 1 Output (Patient Intelligence)
```json
{
  "visitContext": {
    "visitType": "string",
    "reasonForVisit": "string | { value: string, evidence: string[] }"
  },
  "patientGoals": {
    "primaryConcern": "string | { value: string, evidence: string[] }",
    "secondaryConcerns": "string[] | { value: string, evidence: string[] }[]"
  }
}
```

### 3.2. Pass 2 Output (Commercial KPIs & Evaluation)
```json
{
  "treatmentPlan": {
    "recommendedTreatments": "string[]",
    "clarityScore": "number (0-10)"
  },
  "patientEngagement": {
    "score": "number (0-10)",
    "objections": "string[]"
  }
}
```

## 4. The `FieldWithEvidence` Pattern
Both Mid_Stream and Pulse must handle the `FieldWithEvidence` wrapper pattern. A field may be either a raw string/value OR a `FieldWithEvidence` object:

```typescript
// From Mid_Stream types.ts
type FieldWithEvidence<T> = {
  value: T;
  evidence: string[];
};

// A field may be either:
type MaybeWithEvidence<T> = T | FieldWithEvidence<T>;
```

The transformer's `unwrap` utility must safely handle both cases:

```typescript
function unwrap<T>(field: MaybeWithEvidence<T> | undefined, fallback: T): T {
  if (field === undefined || field === null) return fallback;
  if (typeof field === 'object' && 'value' in (field as object)) {
    return (field as FieldWithEvidence<T>).value;
  }
  return field as T;
}
```

## 5. Supabase Query Pattern
The `ConsultationSessionProvider` should fetch data using the following pattern:

```typescript
const { data: session } = await supabase
  .from('consultation_sessions')
  .select(`
    *,
    ai_outputs (*)
  `)
  .eq('id', sessionId)
  .single();

// Then transform:
const extractionData = transformRawExtractionToSimplified(session.ai_outputs);
```

## 6. Reference Data Access
Pulse now has access to the A360 reference database in Supabase. This database contains:
*   Treatment library (canonical treatment names, categories, descriptions)
*   Objection library (common objection types and recommended responses)
*   Provider profiles

This reference data can be used to enrich the Card System display (e.g., matching a raw treatment name to a canonical entry in the treatment library for a richer card display).
