import { useAuthStore } from "@/app/hooks/useAuthStore";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

export async function apiFetch(path: string, options: RequestInit = {}) {
  // Get accessToken from Zustand store (client only)
  let accessToken: string | null = null;
  if (typeof window !== "undefined") {
    try {
      // Dynamically import to avoid SSR issues
      accessToken = useAuthStore.getState().accessToken;
    } catch {}
  }
  const url = path.startsWith("http") ? path : `${BASE_URL}${path.startsWith("/") ? path : "/" + path}`;
  const isAuthRoute = /\/auth\/(login|register)/.test(path);
  const headers = new Headers(options.headers || {});
  if (accessToken && !isAuthRoute) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  return fetch(url, { ...options, headers });
}