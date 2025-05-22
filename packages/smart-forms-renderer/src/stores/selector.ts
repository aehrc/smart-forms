import type { StoreApi } from 'zustand';
import { useStore } from 'zustand';

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never;

export const createSelectors = <T extends object>(_store: StoreApi<T>) => {
  const store = _store as WithSelectors<typeof _store>;
  store.use = {} as { [K in keyof T]: () => T[K] };

  const state = store.getState();

  // Create selectors for state properties and methods
  for (const k of Object.keys(state)) {
    const key = k as keyof T;
    store.use[key] = () => useStore(_store, (s) => s[key]);
  }

  return store;
};
