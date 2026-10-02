// Global auth/cart store (tokens persisted). Usable outside React (API layer) and inside via useStore().
import { useSyncExternalStore } from 'react';

const KEY = 'restaurant.auth';
const listeners = new Set();
let state = { accessToken: null, refreshToken: null, user: null, cartCount: 0 };

try {
  const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
  state = { ...state, accessToken: saved.accessToken || null, refreshToken: saved.refreshToken || null };
} catch { /* ignore */ }

const set = (patch) => { state = { ...state, ...patch }; listeners.forEach((fn) => fn()); };
const persist = () => {
  try { localStorage.setItem(KEY, JSON.stringify({ accessToken: state.accessToken, refreshToken: state.refreshToken })); } catch { /* storage unavailable */ }
};

export const store = {
  get state() { return state; },
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  setTokens({ accessToken, refreshToken }) {
    set({ accessToken: accessToken || null, refreshToken: refreshToken || state.refreshToken });
    persist();
  },
  setUser: (user) => set({ user }),
  setCartCount: (n) => set({ cartCount: n || 0 }),
  clear() {
    set({ accessToken: null, refreshToken: null, user: null, cartCount: 0 });
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  },
};

export const useStore = () => useSyncExternalStore(store.subscribe, () => state);
