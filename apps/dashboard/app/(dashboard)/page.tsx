// apps/dashboard/app/(dashboard)/page.tsx
"use client";

import { WalletSummaryCard } from "../../components/WalletSummaryCard";
import { StatCard } from "../../components/StatCard";
import { TransactionTable } from "../../components/TransactionTable";
import { useEffect, useState } from "react";
import { getHealth, getWalletOverview, getRecentTransactions } from "../../lib/api";
import React from "react";

export default function DashboardHome() {
  const [health, setHealth] = useState<string>("checking...");
  const [overview, setOverview] = useState<any | null>(null);
  const [txs, setTxs] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const h = await getHealth();
      setHealth(h.status ?? "unknown");

      const ov = await getWalletOverview();
      setOverview(ov);

      const recent = await getRecentTransactions();
      setTxs(recent);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <WalletSummaryCard overview={overview} />
        <StatCard
          title="Node Health"
          value={health === "ok" ? "Healthy" : "Degraded"}
          hint="Backend / workers / MPC services"
          variant={health === "ok" ? "success" : "warning"}
        />
        <StatCard
          title="MPC Rounds"
          value={overview?.mpcRounds ?? 0}
          hint="Total MPC signing rounds executed"
        />
        <StatCard
          title="Hedera Topics"
          value={overview?.topics ?? 0}
          hint="Active consensus channels for audit logs"
        />
      </div>

      <TransactionTable transactions={txs} />
    </div>
  );
}