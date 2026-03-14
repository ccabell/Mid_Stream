export const ROUTES = {
  HOME: '/',
  HUB: '/hub',
  DASHBOARD: '/dashboard',
  RUNS: '/runs',
  RUN_DETAIL: '/runs/:runId',
  RUN_HITL: '/runs/:runId/hitl',
  CONSULTATION_DETAIL: '/consultations/:runId',
  OPPORTUNITIES: '/opportunities',
  AGENTS: '/agents',
  PRACTICE_LIBRARY: '/practice-library',
  PROMPTS: '/prompts',
} as const;

export const runDetailPath = (runId: string) => `/runs/${runId}`;
export const runHitlPath = (runId: string) => `/runs/${runId}/hitl`;
export const consultationDetailPath = (runId: string) => `/consultations/${runId}`;
