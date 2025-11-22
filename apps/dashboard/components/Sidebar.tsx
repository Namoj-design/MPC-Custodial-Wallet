// apps/dashboard/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const navItems = [
  { href: "/(dashboard)", label: "Overview" },
  { href: "/(dashboard)/wallet", label: "Wallet" },
  { href: "/(dashboard)/transactions", label: "Transactions" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-60 flex-col border-r border-slate-800 bg-slate-950/90">
      <div className="px-4 py-4 text-sm font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-800">
        Console
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-sm transition ${
                active
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                  : "text-slate-300 hover:bg-slate-800/60"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}