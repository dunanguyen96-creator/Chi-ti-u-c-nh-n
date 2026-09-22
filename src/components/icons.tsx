import type { ReactNode } from "react";

function base(children: ReactNode) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={17}
      height={17}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function HomeIcon() {
  return base(
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9v10.5a1 1 0 0 0 1 1H9a1 1 0 0 0 1-1V15a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4.5a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1V9" />
    </>,
  );
}

export function ListIcon() {
  return base(
    <>
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <path d="M3 6h.01" />
      <path d="M3 12h.01" />
      <path d="M3 18h.01" />
    </>,
  );
}

export function ChartIcon() {
  return base(
    <>
      <path d="M4 19V10" />
      <path d="M10 19V5" />
      <path d="M16 19v-7" />
      <path d="M3 19h18" />
    </>,
  );
}

export function CardIcon() {
  return base(
    <>
      <rect x={2.5} y={5.5} width={19} height={13} rx={2} />
      <path d="M2.5 10h19" />
    </>,
  );
}
