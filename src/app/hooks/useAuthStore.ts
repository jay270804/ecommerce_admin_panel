import { create } from "zustand";

interface User {
  id: string;
  email?: string;
  role: string;
  [key: string]: any;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  setAuth: (auth: { accessToken: string; refreshToken: string; user: User }) => void;
  clearAuth: () => void;
}

export type { AuthState };

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  setAuth: ({ accessToken, refreshToken, user }) => {
    set({ accessToken, refreshToken, user });
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));
    }
  },
  clearAuth: () => {
    set({ accessToken: null, refreshToken: null, user: null });
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
  },
}));