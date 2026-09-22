"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Tổng quan" },
  { href: "/giao-dich", label: "Giao dịch" },
  { href: "/bao-cao", label: "Báo cáo" },
  { href: "/no-the", label: "Nợ / Thẻ" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-black/10 dark:border-white/10 sticky top-0 z-10 bg-[var(--background)]/90 backdrop-blur">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-6 flex-wrap">
        <span className="font-semibold text-lg shrink-0">💰 Chi tiêu cá nhân</span>
        <nav className="flex gap-1 flex-wrap">
          {LINKS.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? "bg-emerald-600 text-white"
                    : "text-foreground/70 hover:bg-black/5 dark:hover:bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
