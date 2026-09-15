"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Leichtgewichtiger Ersatz für SWR/react-query: pollt einen Endpoint
// in festem Intervall und liefert loading/error-State zurück. Reicht
// für ein Single-User-Dashboard völlig aus und hält die Abhängigkeiten
// klein.

export function usePolling<T>(url: string, intervalMs: number, initial: T) {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const mounted = useRef(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch(url, { cache: "no-store" });
      const json = await res.json();
      if (!mounted.current) return;
      setData(json);
      setLastUpdated(new Date());
    } catch {
      // Netzwerkfehler: alten Stand behalten, nächster Poll versucht's erneut
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    mounted.current = true;
    load();
    const id = setInterval(load, intervalMs);
    return () => {
      mounted.current = false;
      clearInterval(id);
    };
  }, [load, intervalMs]);

  return { data, loading, lastUpdated, reload: load };
}
