import type { StoreApi } from 'zustand';
import { useStore } from 'zustand';

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never;

export const createSelectors = <S extends StoreApi<object>>(_store: S) => {
  const store = _store as WithSelectors<typeof _store>;
  store.use = {};
  for (const k of Object.keys(store.getState())) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    (store.use as any)[k] = () => useStore(_store, (s) => s[k as keyof typeof s]);
  }

  return store;
};
