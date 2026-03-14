# Mid_Stream Agent Development Guide

This guide explains how to build agents for the Mid_Stream platform. Agents are modular components that process consultation data to deliver specific functionality.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Mid_Stream Core                         │
├─────────────────────────────────────────────────────────────┤
│  Runs API          │  Practice Library API                   │
│  (Extraction Data) │  (Services, Products, Packages)         │
└────────┬───────────┴─────────────┬───────────────────────────┘
         │                         │
         ▼                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     Agent Registry                           │
├─────────────────────────────────────────────────────────────┤
│  HITL Agent  │  TCP Agent  │  Your Agent  │  Future Agents   │
└──────────────┴─────────────┴──────────────┴──────────────────┘
```

### Core Data Sources

Your agent will consume data from these sources:

1. **Runs API** (`/api/runs`) - Extraction output from consultation transcripts
   - Pass 1: Visit context, patient goals, areas, interests, offerings
   - Pass 2: Outcome, next steps, patient signals, objections, concerns, checklist

2. **Practice Library API** (`/api/practice-library`) - Practice-specific configuration
   - Services with pricing, concerns addressed, synergies
   - Products with categories and pricing tiers
   - Packages with bundled items and savings
   - Concern vocabulary for matching

---

## Agent Interface

All agents must implement the `AgentModule` interface defined in `src/agents/types.ts`.

### Required Properties

```typescript
import type { ComponentType } from 'react';
import type { AgentModule, AgentPageProps } from '../types';

export const myAgent: AgentModule = {
  // Unique identifier (snake_case)
  id: 'my_agent',

  // Display name shown in UI
  name: 'My Agent',

  // Brief description
  description: 'What this agent does',

  // Semantic version
  version: '1.0.0',

  // What input this agent requires
  inputType: 'extraction_output', // See AgentInputType below

  // Required fields from the input
  requiredFields: ['prompt_1', 'prompt_2'],

  // Agent capabilities
  capabilities: {
    canRunStandalone: true,      // Accessible via /agents/{id}
    canRunFromRunDetail: true,   // Can be invoked from RunDetail page
    canBeShared: false,          // Can be exported as standalone app
    requiresPracticeLibrary: true,
    chainableOutputs: ['tcp_generator'], // IDs of agents that consume output
  },

  // Optional: MUI icon name
  icon: 'AutoAwesome',

  // Optional: Category for grouping
  category: 'verification',

  // The main page component
  Page: MyAgentPage,
};
```

### Input Types

```typescript
type AgentInputType =
  | 'extraction_output'    // Raw Pass 1 + Pass 2 extraction
  | 'hitl_verified'        // HITL-verified data (from HITL agent)
  | 'tcp_output'           // TCP document (from TCP agent)
  | 'practice_library'     // Practice library data
  | 'custom';              // Custom input type
```

### Categories

```typescript
type AgentCategory =
  | 'extraction'     // Works directly with extraction output
  | 'verification'   // Verification/HITL agents
  | 'generation'     // Generates documents (TCP, emails)
  | 'management'     // Management UIs (practice library)
  | 'analytics';     // Analytics/reporting agents
```

---

## Page Component Props

Your Page component receives these props:

```typescript
interface AgentPageProps {
  // Run ID if invoked from a specific run
  runId?: string;

  // Pre-loaded extraction output (optimization)
  extractionOutput?: ExtractionOutput;

  // Pre-loaded HITL output (for chained agents)
  hitlOutput?: HITLVerifiedOutput;

  // Practice ID for context
  practiceId?: string;

  // Callback when agent completes successfully
  onComplete?: (result: AgentOutput) => void;

  // Callback when user cancels
  onCancel?: () => void;

  // Whether this is embedded in another page
  embedded?: boolean;
}
```

---

## File Structure

Create your agent in a dedicated folder:

```
src/agents/
├── types.ts              # Shared interfaces (DO NOT MODIFY)
├── registry.ts           # Agent registration (ADD YOUR AGENT HERE)
└── my_agent/             # Your agent folder
    ├── index.ts          # Exports AgentModule
    ├── MyAgentPage.tsx   # Main page component
    ├── components/       # Agent-specific components
    │   ├── StepOne.tsx
    │   ├── StepTwo.tsx
    │   └── index.ts
    ├── hooks/            # Agent-specific hooks
    │   ├── useMyAgentState.ts
    │   └── index.ts
    └── utils/            # Agent-specific utilities
        └── index.ts
```

---

## Step-by-Step: Creating an Agent

### 1. Create the Agent Folder

```bash
mkdir -p src/agents/my_agent/components src/agents/my_agent/hooks src/agents/my_agent/utils
```

### 2. Create the Page Component

`src/agents/my_agent/MyAgentPage.tsx`:

```typescript
import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import type { AgentPageProps, AgentOutput } from '../types';
import { usePracticeLibraryStore } from 'stores';

export function MyAgentPage({
  runId,
  extractionOutput,
  practiceId,
  onComplete,
  onCancel,
  embedded,
}: AgentPageProps) {
  const [processing, setProcessing] = useState(false);

  // Access practice library data
  const services = usePracticeLibraryStore(state => state.services);
  const products = usePracticeLibraryStore(state => state.products);

  // Load practice data if needed
  useEffect(() => {
    if (practiceId) {
      // Load practice-specific data
    }
  }, [practiceId]);

  const handleComplete = () => {
    const result: AgentOutput = {
      agent_id: 'my_agent',
      run_id: runId || '',
      output: {
        // Your agent's output data
      },
      status: 'completed',
      created_at: new Date().toISOString(),
    };

    onComplete?.(result);
  };

  return (
    <Box sx={{ p: embedded ? 0 : 3 }}>
      <Typography variant="h5" gutterBottom>
        My Agent
      </Typography>

      {/* Your agent UI here */}

      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleComplete}
          disabled={processing}
        >
          Complete
        </Button>
      </Box>
    </Box>
  );
}
```

### 3. Create the Agent Module Export

`src/agents/my_agent/index.ts`:

```typescript
import type { AgentModule } from '../types';
import { MyAgentPage } from './MyAgentPage';

export const myAgent: AgentModule = {
  id: 'my_agent',
  name: 'My Agent',
  description: 'Description of what this agent does',
  version: '1.0.0',
  inputType: 'extraction_output',
  requiredFields: ['prompt_1', 'prompt_2'],
  capabilities: {
    canRunStandalone: true,
    canRunFromRunDetail: true,
    canBeShared: false,
    requiresPracticeLibrary: true,
  },
  category: 'verification',
  Page: MyAgentPage,
};

export { MyAgentPage };
```

### 4. Register the Agent

Update `src/agents/registry.ts`:

```typescript
import type { AgentModule, AgentCategory } from './types';
import { myAgent } from './my_agent';

export const agentRegistry: AgentModule[] = [
  myAgent,
  // ... other agents
];
```

---

## Accessing Core Data

### Extraction Output

The extraction output contains two passes:

```typescript
interface ExtractionOutput {
  prompt_1: {
    parsed_json: Pass1Output;  // Context, goals, offerings
    raw_response?: string;
  };
  prompt_2: {
    parsed_json: Pass2Output;  // Outcome, signals, objections
    raw_response?: string;
  };
}
```

**Pass 1 Output:**
- `visit_context` - Visit type, reason, referred by, motivating event
- `patient_goals` - Primary concern, secondary concerns, goals, outcomes
- `areas` - Treatment areas, concern areas
- `interests` - Stated interests, future interests with evidence
- `offerings` - Services/products discussed with disposition

**Pass 2 Output:**
- `outcome` - Status and summary
- `next_steps` - Actions with timeframe and owner
- `patient_signals` - Commitment level
- `objections` - Price, timing, fear, etc. with resolution
- `hesitations` - Topics with resolution status
- `concerns` - Clinical, practical, safety, financial
- `visit_checklist` - Safety/clinical/education items

### Practice Library

Use the Zustand store to access practice data:

```typescript
import { usePracticeLibraryStore } from 'stores';

function MyComponent() {
  // Get data
  const services = usePracticeLibraryStore(state => state.services);
  const products = usePracticeLibraryStore(state => state.products);
  const packages = usePracticeLibraryStore(state => state.packages);
  const concerns = usePracticeLibraryStore(state => state.concerns);

  // Get actions
  const actions = usePracticeLibraryStore(state => state.actions);

  // Load data for a practice
  useEffect(() => {
    actions.loadServices({ practiceId: 'uuid' });
  }, []);
}
```

Or use the custom hooks:

```typescript
import { useServices, useProducts, usePackages } from 'stores';

function MyComponent() {
  const { services, loading, error } = useServices();
  const { products } = useProducts();
}
```

---

## Agent Output Format

When your agent completes, return an `AgentOutput`:

```typescript
interface AgentOutput {
  agent_id: string;        // Your agent's ID
  run_id: string;          // The run being processed
  input_ref?: string;      // Reference to input (e.g., HITL output ID)
  output: object;          // Your agent's output data
  status: 'completed' | 'partial' | 'failed';
  created_at: string;      // ISO timestamp
  metadata?: Record<string, unknown>;
}
```

---

## Chainable Agents

If your agent's output can be consumed by other agents:

1. Define `chainableOutputs` in capabilities:
   ```typescript
   capabilities: {
     chainableOutputs: ['tcp_generator', 'email_agent'],
   }
   ```

2. Structure your output to match the expected input type:
   ```typescript
   // If outputting for tcp_generator, match HITLVerifiedOutput
   output: HITLVerifiedOutput;
   ```

3. The registry's `getChainableAgents()` function enables the UI to show "Next Steps" after your agent completes.

---

## UI Guidelines

### Styling

Use MUI v7 components and the A360 theme:

```typescript
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

function MyComponent() {
  const theme = useTheme();

  return (
    <Box sx={{
      p: 2,
      backgroundColor: theme.palette.background.paper,
      borderRadius: 1,
    }}>
      <Typography variant="h6" color="text.primary">
        Title
      </Typography>
    </Box>
  );
}
```

### Common Patterns

- Use `PageHeader` component for consistent page headers
- Use `SectionCard` for grouping related content
- Use `StatusBadge` for status indicators
- Use `EmptyState` when no data is available
- Use `ScoreRing` for displaying scores

### Embedded vs Standalone

Check `embedded` prop to adjust layout:

```typescript
<Box sx={{
  p: embedded ? 0 : 3,
  maxWidth: embedded ? '100%' : 1200,
}}>
```

---

## Testing Your Agent

### 1. Unit Tests

Create tests in `src/agents/my_agent/__tests__/`:

```typescript
import { render, screen } from '@testing-library/react';
import { MyAgentPage } from '../MyAgentPage';

describe('MyAgentPage', () => {
  it('renders without crashing', () => {
    render(<MyAgentPage />);
    expect(screen.getByText('My Agent')).toBeInTheDocument();
  });
});
```

### 2. Integration Testing

Test with real extraction data:

```typescript
const mockExtractionOutput = {
  prompt_1: {
    parsed_json: {
      extraction_version: '3.0',
      pass: 1,
      visit_context: { /* ... */ },
      patient_goals: { /* ... */ },
      // ...
    }
  },
  prompt_2: {
    parsed_json: {
      extraction_version: '3.0',
      pass: 2,
      outcome: { /* ... */ },
      // ...
    }
  }
};

render(
  <MyAgentPage
    extractionOutput={mockExtractionOutput}
    practiceId="test-practice-id"
  />
);
```

---

## Deployment

### Standalone Export

If `canBeShared: true`, your agent can be exported as a standalone application:

1. Ensure all dependencies are within your agent folder
2. Don't rely on external state beyond the provided props
3. Include all necessary API calls within your agent

### Registration Checklist

Before submitting your agent:

- [ ] Implements `AgentModule` interface completely
- [ ] Page component handles all props correctly
- [ ] Works with and without `extractionOutput` pre-loaded
- [ ] Handles missing practice library gracefully
- [ ] Calls `onComplete` with valid `AgentOutput`
- [ ] Calls `onCancel` when user cancels
- [ ] Works in both standalone and embedded modes
- [ ] Unit tests pass
- [ ] No console errors or warnings

---

## API Reference

### Runs API

```typescript
import { getRunById, getRunOutput } from 'apiServices/runs.api';

// Get run metadata
const run = await getRunById(runId);

// Get extraction output
const output = await getRunOutput(runId);
```

### Practice Library API

```typescript
import {
  getPLServices,
  getPLProducts,
  getPLPackages,
  getPLConcerns,
} from 'apiServices/practiceLibrary';

// Get services for a practice
const services = await getPLServices({ practiceId: 'uuid' });

// Get products
const products = await getPLProducts({ practiceId: 'uuid' });
```

---

## Support

- **Architecture Questions**: Reference `src/agents/types.ts` for all type definitions
- **UI Patterns**: Check existing components in `src/components/`
- **Store Patterns**: Reference `src/stores/practiceLibraryStore/` for Zustand patterns

---

## Example Agents

| Agent | Input Type | Output | Description |
|-------|------------|--------|-------------|
| HITL Verification | `extraction_output` | `hitl_verified` | Provider verification of extraction |
| TCP Generator | `hitl_verified` | `tcp_output` | Generates Treatment & Care Plans |
| Practice Library | `practice_library` | N/A | Manages practice configuration |

---

*Last Updated: March 2026*
