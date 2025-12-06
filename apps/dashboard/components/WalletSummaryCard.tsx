// apps/dashboard/components/WalletSummaryCard.tsx
import React from "react";
import { StatCard } from "./StatCard";

interface WalletSummaryCardProps {
  overview: any | null;
}

export function WalletSummaryCard({ overview }: WalletSummaryCardProps) {
  const balance = overview?.balance ?? "0.0000";
  const accountId = overview?.accountId ?? "N/A";
  const network = overview?.network ?? "testnet";

  return (
    <div className="min-w-[260px] flex-1">
      <StatCard
        title="Primary Custodial Wallet"
        value={`${balance} ℏ`}
        hint={`Account: ${accountId} • ${network}`}
        variant="primary"
      />
    </div>
  );
}