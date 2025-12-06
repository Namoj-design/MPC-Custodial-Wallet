// apps/dashboard/components/Navbar.tsx
"use client";

import React from "react";
import { useAuthStore } from "../store/useAuthStore";

export function Navbar() {
  const { user, clearAuth } = useAuthStore();

  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-3">
      <div className="font-semibold tracking-tight">
        MPC Custodial Wallet <span className="text-xs text-emerald-400">• Hedera</span>
      </div>
      <div className="flex items-center gap-3 text-sm">
        {user && (
          <>
            <span className="text-slate-300">{user.email}</span>
            <button
              className="rounded-md border border-slate-600 px-3 py-1 hover:border-red-400 hover:text-red-300 text-xs"
              onClick={clearAuth}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}