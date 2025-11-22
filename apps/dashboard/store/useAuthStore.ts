// apps/dashboard/store/useAuthStore.ts
"use client";

import { create } from "zustand";

interface User {
  id: string;
  email: string;
  role: string;
  [key: string]: any;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  setAuth: (token, user) => {
    set({ token, user });
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_user", JSON.stringify(user));
    }
  },
  clearAuth: () => {
    set({ token: null, user: null });
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
    }
  },
}));

// Optional: you can hydrate from localStorage on app start in a custom Provider