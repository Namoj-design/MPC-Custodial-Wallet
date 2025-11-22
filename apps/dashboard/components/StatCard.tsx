// apps/dashboard/components/StatCard.tsx
import React from "react";
import { StatusBadge } from "./StatusBadge";

type Variant = "default" | "success" | "warning" | "primary";

interface StatCardProps {
  title: string;
  value: string | number;
  hint?: string;
  variant?: Variant;
}

export function StatCard({ title, value, hint, variant = "default" }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 shadow-sm min-w-[200px]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wide text-slate-400">
          {title}
        </span>
        <StatusBadge variant={variant} />
      </div>
      <div className="text-xl font-semibold text-slate-50">{value}</div>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}