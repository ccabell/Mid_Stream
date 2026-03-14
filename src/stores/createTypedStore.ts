/**
 * Typed Zustand store creator
 *
 * Aligned with A360 stores/createTypedStore.ts pattern
 */

import type { StateCreator } from 'zustand';
import { create as actualCreate } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

type Middleware = [['zustand/devtools', never], ['zustand/persist', unknown], ['zustand/immer', never]];

type WithActions = { actions?: unknown };

type StoreOptions<T, PT> = {
  persistOptions: {
    name: string;
    partialize?: (state: T) => PT;
  };
  devtoolsOptions?: {
    name?: string;
  };
  isResettable?: boolean;
};

const storeResetFns = new Set<() => void>();

export const resetAllStores = (): void => {
  storeResetFns.forEach((fn) => fn());
};

export const createTypedStore = <T extends WithActions, PT = Omit<T, 'actions'>>(
  state: StateCreator<T, Middleware>,
  options: StoreOptions<T, PT>
) => {
  const { persistOptions, devtoolsOptions, isResettable = true } = options;

  const store = actualCreate<T>()(
    devtools(
      persist(immer(state), {
        ...persistOptions,
        partialize:
          persistOptions.partialize ??
          ((state) => {
            const { actions, ...rest } = state as T & { actions: unknown };
            return rest as PT;
          }),
      }),
      {
        enabled: import.meta.env.DEV,
        ...devtoolsOptions,
      }
    )
  );

  if (isResettable) {
    storeResetFns.add(() => {
      store.setState(() => store.getInitialState(), true);
    });
  }

  return store;
};
