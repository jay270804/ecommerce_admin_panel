import { useAuthStore } from "@/app/hooks/useAuthStore";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

async function refreshAccessToken(refreshToken: string) {
  const res = await fetch(`${BASE_URL}/auth/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) throw new Error("Failed to refresh token");
  const data = await res.json();
  return data.data?.accessToken;
}

export async function apiFetch(path: string, options: RequestInit = {}, retry = true) {
  // Get accessToken and refreshToken from Zustand store (client only)
  let accessToken: string | null = null;
  let refreshToken: string | null = null;
  if (typeof window !== "undefined") {
    try {
      // Dynamically import to avoid SSR issues
      const state = useAuthStore.getState();
      accessToken = state.accessToken;
      refreshToken = state.refreshToken;
    } catch {}
  }
  const url = path.startsWith("http") ? path : `${BASE_URL}${path.startsWith("/") ? path : "/" + path}`;
  const isAuthRoute = /\/auth\/(login|register|refresh-token)/.test(path);
  const headers = new Headers(options.headers || {});
  if (accessToken && !isAuthRoute) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  let response = await fetch(url, { ...options, headers });
  if (response.status === 401 && refreshToken && retry && !isAuthRoute) {
    try {
      const newAccessToken = await refreshAccessToken(refreshToken);
      if (newAccessToken) {
        // Update Zustand store
        if (typeof window !== "undefined") {
          const user = useAuthStore.getState().user;
          useAuthStore.getState().setAuth({
            accessToken: newAccessToken,
            refreshToken,
            user: user || { id: "", role: "" }, // fallback to empty user if null
          });
        }
        // Retry original request with new token
        headers.set("Authorization", `Bearer ${newAccessToken}`);
        response = await fetch(url, { ...options, headers });
      }
    } catch (err) {
      // If refresh fails, clear auth and return original 401
      if (typeof window !== "undefined") {
        useAuthStore.getState().clearAuth();
      }
      return response;
    }
  }
  return response;
}