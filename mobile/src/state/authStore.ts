import { create } from "zustand";
import { getItem, setItem, deleteItem } from "../api/secureStorage";
import { getOrCreateDeviceId } from "../api/deviceId";
import { apiRequest } from "../api/client";

const TOKEN_KEY = "grandma_auth_token";

export interface AppUser {
  id: string;
  email: string | null;
  isGuest: boolean;
  preferredName: string | null;
  onboardingCompleted: boolean;
}

interface AuthState {
  token: string | null;
  user: AppUser | null;
  isBootstrapping: boolean;
  bootstrap: () => Promise<void>;
  setSession: (token: string, user: AppUser) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  upgradeGuest: (email: string, password: string) => Promise<void>;
  refreshMe: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isBootstrapping: true,

  // Silent guest creation - the app is usable within seconds, no signup screen (docs/ARCHITECTURE.md).
  bootstrap: async () => {
    const existingToken = await getItem(TOKEN_KEY);
    if (existingToken) {
      set({ token: existingToken });
      try {
        await get().refreshMe();
      } catch {
        // Token invalid/expired - fall through to re-issuing a guest session.
        set({ token: null, user: null });
      }
    }
    if (!get().token) {
      const deviceId = await getOrCreateDeviceId();
      const res = await apiRequest<{ token: string; user: AppUser }>("/auth/guest", {
        method: "POST",
        body: { deviceId },
        auth: false,
      });
      await get().setSession(res.token, res.user);
    }
    set({ isBootstrapping: false });
  },

  setSession: async (token, user) => {
    await setItem(TOKEN_KEY, token);
    set({ token, user });
  },

  signup: async (email, password) => {
    const res = await apiRequest<{ token: string; user: AppUser }>("/auth/signup", { method: "POST", body: { email, password }, auth: false });
    await get().setSession(res.token, res.user);
  },

  login: async (email, password) => {
    const res = await apiRequest<{ token: string; user: AppUser }>("/auth/login", { method: "POST", body: { email, password }, auth: false });
    await get().setSession(res.token, res.user);
  },

  upgradeGuest: async (email, password) => {
    const res = await apiRequest<{ token: string; user: AppUser }>("/auth/upgrade", { method: "POST", body: { email, password } });
    await get().setSession(res.token, res.user);
  },

  refreshMe: async () => {
    const res = await apiRequest<{ user: AppUser }>("/auth/me");
    set({ user: res.user });
  },

  logout: async () => {
    await deleteItem(TOKEN_KEY);
    set({ token: null, user: null });
    await get().bootstrap();
  },
}));
