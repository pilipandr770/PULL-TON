import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  walletAddress: string;
  hasSubscription: boolean;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

interface AdminState {
  token: string | null;
  admin: { id: string; email: string; role: string } | null;
  isAdmin: boolean;
  setAdmin: (token: string, admin: { id: string; email: string; role: string }) => void;
  logoutAdmin: () => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      token: null,
      admin: null,
      isAdmin: false,
      setAdmin: (token, admin) => set({ token, admin, isAdmin: true }),
      logoutAdmin: () => set({ token: null, admin: null, isAdmin: false }),
    }),
    {
      name: 'admin-storage',
    }
  )
);
