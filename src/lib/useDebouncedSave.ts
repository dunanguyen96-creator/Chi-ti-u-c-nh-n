import { useCallback, useRef, useState } from "react";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export function useDebouncedSave<T>(
  saveFn: (value: T) => Promise<void>,
  delay = 600,
) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trigger = useCallback(
    (value: T) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      setStatus("saving");
      timerRef.current = setTimeout(async () => {
        try {
          await saveFn(value);
          setStatus("saved");
          resetTimerRef.current = setTimeout(() => setStatus("idle"), 1800);
        } catch {
          setStatus("error");
        }
      }, delay);
    },
    [saveFn, delay],
  );

  return { status, trigger };
}
