# Claude Code Task: Module 3 - Agent Runner

## Context
You are building the **Agent Runner Module** for the Pulse project. This module allows users to run specialized AI agents (e.g., "Generate Marketing Email", "Draft Treatment Plan") against the consultation context.

## Goal
Create `src/modules/agent-runner/` and implement the UI and API client to trigger and display agent runs.

## Step-by-Step Instructions

### Step 1: Create the Module Structure
1. Create directory: `src/modules/agent-runner/`
2. Create `src/modules/agent-runner/types.ts`.
   - Define `AgentDefinition` (id, name, description, requiredInputs).
   - Define `AgentRunRequest` and `AgentRunResult`.
3. Create `src/modules/agent-runner/api.ts`.
   - Implement the API client to trigger the agent run on the backend (mock this if the backend endpoint isn't ready, but define the signature).
4. Create `src/modules/agent-runner/index.ts`.

### Step 2: Build the UI Components
1. Create `src/modules/agent-runner/components/AgentSelector.tsx`.
   - A dropdown or list of available agents.
2. Create `src/modules/agent-runner/components/RunStatusIndicator.tsx`.
   - A loading state component while the agent is running.
3. Create `src/modules/agent-runner/components/ResultRenderer.tsx`.
   - A component to display the agent's output. Use the Card System (e.g., `SummaryCard` with markdown support) to render the result.

### Step 3: Wire into the Application
1. Integrate the `AgentSelector` into the Consultation Profile UI (e.g., a floating action button or a dedicated "Actions" panel).
2. Ensure the agent run request includes the `consultationId` and any necessary context from the `ConsultationSessionContext`.

## Constraints
- The UI must be non-blocking; the user should be able to navigate away while an agent is running (if supported by the backend).
- Use the standard A360 UI components for buttons, dropdowns, and loading spinners.
