const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

export async function apiFetch(path: string, options?: RequestInit) {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path.startsWith("/") ? path : "/" + path}`;
  return fetch(url, options);
}