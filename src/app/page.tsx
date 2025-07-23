"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useHasHydrated } from "./hooks/useHasHydrated";

export default function Home() {
  const router = useRouter();
  const hasHydrated = useHasHydrated();

  useEffect(() => {
    if (!hasHydrated) return;
    router.replace("/dashboard");
  }, [hasHydrated, router]);

  return <div>Redirecting...</div>;
}
