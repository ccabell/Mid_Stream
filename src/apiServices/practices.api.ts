import { client } from './client';
import type { Practice } from './types';

export const practicesApi = {
  list: () =>
    client.get<Practice[]>('/practices').then((r) => r.data),

  getById: (id: string) =>
    client.get<Practice>(`/practices/${id}`).then((r) => r.data),
};
