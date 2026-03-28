# Specification: A360 Pulse — Pages, Routes, and Modules

## 1. Overview
This document defines the complete page and route structure for A360 Pulse, mapping each page to the modules it depends on and the data it consumes from Supabase. This is the master reference for planning and building out the Pulse UI.

## 2. Current Route Structure (Existing)
Based on the Pulse router (`src/App/router/App.router.tsx`), the following routes already exist:

| Route | Component | Status |
|---|---|---|
| `/` | `Home` | Exists |
| `/patients` | `Patients` | Exists |
| `/patients/:patientId` | `PatientDetail` | Exists |
| `/patients/:patientId/session/:sessionId` | `ConsultationSession` | Exists |
| `/cards` | `CardList` | Exists (demo/dev only) |
| `/login` | `Login` | Exists |

## 3. Target Page Architecture
The following pages need to be built out or significantly enhanced:

### 3.1. Consultation Session Page (`/patients/:patientId/session/:sessionId`)
This is the **primary page** for the current sprint. It must display the full extraction output on the Card System.

**Modules Required:**
*   Extraction Module (`src/modules/extraction/`)
*   Card System Module (`src/modules/cards/`)

**Sub-sections / Tabs:**
| Tab | Content | Data Source |
|---|---|---|
| Summary | Patient goals, visit context, primary concern | Extraction Pass 1 |
| Treatment Plan | Recommended treatments, clarity score | Extraction Pass 2 |
| Engagement | Objection cards, engagement score | Extraction Pass 2 |
| Transcript | Raw transcript display | `ConsultationSession.transcript` |

**Data Flow:**
1.  `ConsultationSessionProvider` fetches session data from Supabase.
2.  AI attachment data (e.g., `summaryAI`, `entities`) is passed through the Extraction Transformer.
3.  The transformed `SimplifiedExtractionOutput` is stored in context.
4.  Each tab's component retrieves the relevant slice of data from context.
5.  Data is passed through the Card Mapper and rendered as Card components.

### 3.2. Patient Detail Page (`/patients/:patientId`)
Displays a summary of all consultation sessions for a patient, with a quick-view card for each session.

**Modules Required:**
*   Card System Module (for session summary cards)

**Data Source:** `patients` and `consultation_sessions` tables in Supabase.

### 3.3. Home / Dashboard Page (`/`)
A high-level dashboard showing practice-wide KPIs and recent activity.

**Modules Required:**
*   Card System Module (for KPI cards)

**Data Source:** Aggregated queries from Supabase.

## 4. Shared Module Directory Structure
All shared modules should follow this structure inside the Pulse `src/` directory:

```
src/
  modules/
    extraction/
      types.ts          # SimplifiedExtractionOutput and related interfaces
      transformer.ts    # transformRawExtractionToSimplified function
      index.ts          # Re-exports
    cards/
      mapper.tsx        # mapExtractionToCards function
      index.ts          # Re-exports
```

## 5. Sprint Priority Order
1.  **[P0] Extraction Module** — Create types and transformer. Integrate with `ConsultationSessionProvider`.
2.  **[P0] Card Mapper** — Create the mapper utility. Connect to the Consultation Session page.
3.  **[P1] Consultation Session Tabs** — Build out the Summary, Treatment Plan, and Engagement tabs.
4.  **[P2] Patient Detail Page** — Enhance with session summary cards.
5.  **[P3] Dashboard Page** — Build KPI cards using aggregated Supabase data.
