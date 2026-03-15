import { client } from './client';
import type { Practice } from './types';

export const practicesApi = {
  list: () =>
    client.get<{ data: Practice[] } | Practice[]>('/practices').then((r) => {
      const d = r.data;
      return Array.isArray(d) ? d : (d as { data: Practice[] }).data ?? [];
    }),

  getById: (id: string) =>
    client.get<Practice>(`/practices/${id}`).then((r) => r.data),
};
