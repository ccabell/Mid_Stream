/**
 * Agent Registry
 *
 * Central registration point for all agents.
 * Import agents here and add them to the registry.
 */

import type { AgentModule, AgentCategory } from './types';

// ============================================================================
// AGENT IMPORTS
// ============================================================================

import { hitlAgent } from './hitl';
// import { tcpAgent } from './tcp';
// import { practiceLibraryAgent } from './practice-library';

// ============================================================================
// REGISTRY
// ============================================================================

/**
 * All registered agents.
 * Add new agents here after creating them.
 */
export const agentRegistry: AgentModule[] = [
  hitlAgent,
  // tcpAgent,
  // practiceLibraryAgent,
];

// ============================================================================
// REGISTRY FUNCTIONS
// ============================================================================

/**
 * Get an agent by its ID
 */
export function getAgent(id: string): AgentModule | undefined {
  return agentRegistry.find(a => a.id === id);
}

/**
 * Get all registered agents
 */
export function getAllAgents(): AgentModule[] {
  return agentRegistry;
}

/**
 * Get agents by category
 */
export function getAgentsByCategory(category: AgentCategory): AgentModule[] {
  return agentRegistry.filter(a => a.category === category);
}

/**
 * Get agents that can run from RunDetail page
 */
export function getRunDetailAgents(): AgentModule[] {
  return agentRegistry.filter(a => a.capabilities.canRunFromRunDetail);
}

/**
 * Get agents that can run standalone
 */
export function getStandaloneAgents(): AgentModule[] {
  return agentRegistry.filter(a => a.capabilities.canRunStandalone);
}

/**
 * Get agents that can be shared/exported
 */
export function getShareableAgents(): AgentModule[] {
  return agentRegistry.filter(a => a.capabilities.canBeShared);
}

/**
 * Get agents that can consume output from a given agent
 */
export function getChainableAgents(sourceAgentId: string): AgentModule[] {
  const sourceAgent = getAgent(sourceAgentId);
  if (!sourceAgent?.capabilities.chainableOutputs) {
    return [];
  }
  return sourceAgent.capabilities.chainableOutputs
    .map(id => getAgent(id))
    .filter((a): a is AgentModule => a !== undefined);
}

// ============================================================================
// AGENT METADATA
// ============================================================================

/**
 * Agent category display names
 */
export const categoryLabels: Record<AgentCategory, string> = {
  extraction: 'Extraction',
  verification: 'Verification',
  generation: 'Generation',
  management: 'Management',
  analytics: 'Analytics',
};

/**
 * Agent category descriptions
 */
export const categoryDescriptions: Record<AgentCategory, string> = {
  extraction: 'Work directly with extraction outputs',
  verification: 'Human-in-the-loop verification',
  generation: 'Generate documents and content',
  management: 'Manage practice data and settings',
  analytics: 'Analytics and reporting',
};
