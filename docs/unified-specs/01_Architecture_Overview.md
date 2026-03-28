# Unified Architecture Overview: Mid_Stream & A360 Pulse

## 1. The Core Concept: Mid_Stream as the Proving Ground
The overarching strategy for this unified development effort is to use **Mid_Stream** as the rapid prototyping and testing environment, and **A360 Pulse** as the production-grade, simplified deployment environment.

*   **Mid_Stream**: A flexible, agent-centric environment where complex workflows (like the Human-in-the-Loop or HITL verification, multi-pass extraction, and TCP generation) are built, tested, and refined. It has access to mock data, practice libraries, and complex agent registries.
*   **A360 Pulse**: The streamlined, user-facing application. It consumes the refined outputs of the processes tested in Mid_Stream. Pulse connects directly to the Supabase database for reference data and displays actionable insights using a modular, card-based UI.

## 2. The Module-Sharing Concept
To ensure consistency and reduce duplicated effort, we are adopting a **Shared Module Architecture**. 

### What is a Module?
A module is a self-contained, functional unit of the application that handles a specific domain of data or a specific step in the consultation workflow. Examples include:
*   **Extraction Module**: Handles the parsing and structuring of raw consultation transcripts into actionable data (Pass 1 & Pass 2 outputs).
*   **Card System Module**: A UI framework for displaying structured data (like extraction results) in digestible, interactive cards (Summary Cards, Accordion Cards, Evidence Cards).

### How Sharing Works
1.  **Develop in Mid_Stream**: A module (e.g., the Extraction data transformer) is first built in Mid_Stream. We test its ability to handle edge cases, complex JSON structures, and HITL interactions.
2.  **Simplify for Pulse**: Once the logic is proven, a simplified, robust version of the module is ported to Pulse. 
3.  **Unified Data Contracts**: Both projects must agree on the same TypeScript interfaces for core data structures. For example, the `ExtractionOutput` and `V2Pass1Output` types defined in Mid_Stream must map cleanly to the data structures expected by Pulse's `ConsultationSessionProvider`.

## 3. The Data Flow: From Extraction to Cards
The primary goal of the current sprint is to make the **Extraction Module** work properly and display its output on the **Card System** in Pulse.

### Step-by-Step Flow
1.  **Data Source**: Pulse retrieves consultation data and AI attachments (like `summaryAI`, `entities`) from the Supabase database via the `apiServices` layer.
2.  **State Management**: The `ConsultationSessionProvider` in Pulse holds this data in state.
3.  **Extraction Processing**: The simplified Extraction Module takes the raw AI output (which mirrors the Mid_Stream extraction format) and transforms it into a structured format suitable for UI consumption.
4.  **Card Rendering**: The Card System maps the structured extraction data to specific card components:
    *   *Patient Goals* -> Summary Card
    *   *Treatment Plan Clarity* -> Accordion Card with Evidence Cards nested inside.
    *   *Identified Objections* -> Alert/Summary Cards.

## 4. Development Workflow with Claude Code
To execute this vision, we will use **Spec-Driven Development** in tandem with Claude Code.
*   All documentation and specs live inside the `docs/unified-specs/` folder in both repositories.
*   Developers (and Claude Code) will read these specs *before* writing code.
*   Claude Code will be given specific instructions (see `04_Claude_Code_Instructions.md`) to implement these modules step-by-step, ensuring the simplified Pulse versions align perfectly with the Mid_Stream prototypes.
