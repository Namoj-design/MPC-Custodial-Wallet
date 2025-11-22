// apps/dashboard/app/(dashboard)/wallet/page.tsx
"use client";

import { useEffect, useState } from "react";
import { WalletSummaryCard } from "../../../../components/WalletSummaryCard";
import { getWalletOverview } from "/Users/namojperiakumar/Desktop/MPC-Wallet/apps/dashboard/lib/api.tsx";
import React from "react";

export default function WalletPage() {
  const [overview, setOverview] = useState<any | null>(null);

  useEffect(() => {
    (async () => {
      const ov = await getWalletOverview();
      setOverview(ov);
    })();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold mb-2">Wallet</h1>
      <WalletSummaryCard overview={overview} />
    </div>
  );
}