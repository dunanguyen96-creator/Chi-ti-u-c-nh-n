"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, ListIcon, ChartIcon, CardIcon } from "@/components/icons";
import LiveClock from "@/components/LiveClock";

const LINKS = [
  { href: "/", label: "Tổng quan", Icon: HomeIcon },
  { href: "/giao-dich", label: "Khoản chi", Icon: ListIcon },
  { href: "/bao-cao", label: "Báo cáo", Icon: ChartIcon },
  { href: "/the-tin-dung", label: "Thẻ tín dụng", Icon: CardIcon },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-[var(--card-border)] sticky top-0 z-10 bg-[var(--background)]/90 backdrop-blur">
      <div className="mx-auto max-w-5xl px-4 py-2 sm:py-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6">
        <div className="flex items-center justify-between gap-3">
          <span className="font-semibold text-base sm:text-lg shrink-0 flex items-center gap-1.5">
            <span aria-hidden>💰</span> Quản lý chi tiêu
          </span>
          <LiveClock className="sm:hidden" />
        </div>
        <nav className="flex gap-1">
          {LINKS.map(({ href, label, Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                title={label}
                aria-label={label}
                className={`p-2 sm:px-3 sm:py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                  active
                    ? "bg-[var(--accent)] text-white"
                    : "text-foreground/70 hover:bg-[var(--accent-soft)] hover:text-[var(--accent-soft-fg)]"
                }`}
              >
                <Icon />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>
        <LiveClock className="hidden sm:inline-flex sm:ml-auto" />
      </div>
    </header>
  );
}
