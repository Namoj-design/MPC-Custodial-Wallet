import React from "react";

// apps/dashboard/components/StatusBadge.tsx
interface StatusBadgeProps {
    variant: "default" | "success" | "warning" | "primary";
  }
  
  export function StatusBadge({ variant }: StatusBadgeProps) {
    const color =
      variant === "success"
        ? "bg-emerald-500"
        : variant === "warning"
        ? "bg-amber-400"
        : variant === "primary"
        ? "bg-sky-500"
        : "bg-slate-500";
  
    return (
      <span className="flex items-center gap-1 text-[10px] text-slate-200">
        <span className={`h-2 w-2 rounded-full ${color}`} />
        {variant === "success"
          ? "Healthy"
          : variant === "warning"
          ? "Check"
          : variant === "primary"
          ? "Live"
          : "Info"}
      </span>
    );
  }