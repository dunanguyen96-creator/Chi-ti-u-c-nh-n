"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, ListIcon, ChartIcon, CardIcon } from "@/components/icons";

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
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-6 flex-wrap">
        <span className="font-semibold text-lg shrink-0 flex items-center gap-1.5">
          <span aria-hidden>💰</span> Chi tiêu cá nhân
        </span>
        <nav className="flex gap-1 flex-wrap">
          {LINKS.map(({ href, label, Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  active
                    ? "bg-[var(--accent)] text-white"
                    : "text-foreground/70 hover:bg-[var(--accent-soft)] hover:text-[var(--accent-soft-fg)]"
                }`}
              >
                <Icon />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
