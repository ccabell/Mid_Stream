/**
 * HITL Verification Agent
 *
 * Human-In-The-Loop verification agent that processes extraction output
 * and allows providers to verify, edit, and approve before TCP generation.
 */

import type { AgentModule } from '../types';
import { HITLPage } from './HITLPage';

export const hitlAgent: AgentModule = {
  id: 'hitl_verification',
  name: 'HITL Verification',
  description: 'Provider verification of extraction output before TCP generation',
  version: '1.0.0',
  inputType: 'extraction_output',
  requiredFields: ['prompt_1', 'prompt_2'],
  capabilities: {
    canRunStandalone: false,
    canRunFromRunDetail: true,
    canBeShared: false,
    requiresPracticeLibrary: true,
    chainableOutputs: ['tcp_generator'],
  },
  icon: 'FactCheck',
  category: 'verification',
  Page: HITLPage,
};

// Re-export types and components for external use
export { HITLPage };
export * from './types';
export * from './hooks';
export * from './components';
