import { client } from './client';
import type { Opportunity } from './types';

export const opportunitiesApi = {
  list: () =>
    client.get<{ data: Opportunity[] } | Opportunity[]>('/opportunities').then((r) => {
      const d = r.data;
      return Array.isArray(d) ? d : (d as { data: Opportunity[] }).data ?? [];
    }),

  updateStage: (opportunityId: string, stage: Opportunity['stage']) =>
    client
      .patch<Opportunity>(`/opportunities/${opportunityId}`, { stage })
      .then((r) => r.data),
};
