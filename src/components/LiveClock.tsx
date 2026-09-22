"use client";

import { useEffect, useState } from "react";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatNow(d: Date) {
  const date = `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  return `${date} ${time}`;
}

export default function LiveClock({ className = "" }: { className?: string }) {
  // Start null so the server-rendered markup has no clock text — the real
  // time is only known once this runs on the client — and fill it in via
  // effect to avoid a hydration mismatch against the server's render time.
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from the system clock on mount
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;

  return (
    <span className={`text-[11px] sm:text-xs text-[var(--muted-fg)] tabular-nums shrink-0 ${className}`}>
      {formatNow(now)}
    </span>
  );
}
