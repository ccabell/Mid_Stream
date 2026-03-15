/**
 * TCP Runner Agent
 *
 * Generate Treatment Care Plans with real-time streaming LLM output.
 */

import type { AgentModule } from '../types';
import { TCPRunnerPage } from './TCPRunnerPage';

export const tcpRunnerAgent: AgentModule = {
  id: 'tcp_runner',
  name: 'TCP Runner',
  description: 'Generate Treatment Care Plans with real-time streaming AI',
  version: '1.0.0',
  inputType: 'hitl_verified', // Also accepts extraction_output
  requiredFields: [],
  capabilities: {
    canRunStandalone: true,
    canRunFromRunDetail: true,
    canBeShared: true,
    requiresPracticeLibrary: false,
    chainableOutputs: [],
  },
  icon: 'AutoAwesome',
  category: 'generation',
  Page: TCPRunnerPage,
};

export { TCPRunnerPage };
export * from './types';
export * from './hooks';
export * from './components';
