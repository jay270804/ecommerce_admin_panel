import { useState, useEffect } from "react";
import { useAuthStore } from "./useAuthStore";

export function useHasHydrated() {
  const [hasHydrated, setHasHydrated] = useState(false);
  useEffect(() => {
    // Zustand persist v4+ exposes a 'persist' property
    if (useAuthStore.persist) {
      setHasHydrated(useAuthStore.persist.hasHydrated());
      const unsubHydrate = useAuthStore.persist.onHydrate(() => setHasHydrated(false));
      const unsubFinish = useAuthStore.persist.onFinishHydration(() => setHasHydrated(true));
      return () => {
        unsubHydrate();
        unsubFinish();
      };
    } else {
      // fallback: always hydrated
      setHasHydrated(true);
    }
  }, []);
  return hasHydrated;
}