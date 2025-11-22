// apps/dashboard/app/(dashboard)/wallet/page.tsx
"use client";

import { useEffect, useState } from "react";
import { WalletSummaryCard } from "../../../components/WalletSummaryCard";
import { getSampleWalletOverview } from "../../../lib/api";

export default function WalletPage() {
  const [overview, setOverview] = useState<any | null>(null);

  useEffect(() => {
    (async () => {
      const ov = await getSampleWalletOverview();
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