"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "./hooks/useAuthStore";
import { useHasHydrated } from "./hooks/useHasHydrated";

export default function Home() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const hasHydrated = useHasHydrated();

  useEffect(() => {
    if (!hasHydrated) return;
    if (!user || user.role !== "admin") {
      router.replace("/login");
    }
  }, [user, router, hasHydrated]);

  if (!hasHydrated) {
    return <div>Loading...</div>;
  }
  if (!user || user.role !== "admin") {
    return null;
  }

  function handleLogout() {
    clearAuth();
    document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.replace("/login");
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div>This is Home</div>
      <button
        className="mt-8 px-4 py-2 bg-destructive text-white rounded hover:bg-destructive/80 transition"
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
}
