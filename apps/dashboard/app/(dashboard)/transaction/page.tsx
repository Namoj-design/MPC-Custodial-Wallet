// apps/dashboard/app/(dashboard)/transactions/page.tsx
"use client";

import { useEffect, useState } from "react";
import { TransactionTable } from "../../../components/TransactionTable";
import { getRecentTransactions } from "../../../lib/api";
import React from "react";

export default function TransactionsPage() {
  const [txs, setTxs] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const recent = await getRecentTransactions();
      setTxs(recent);
    })();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold mb-2">Transactions</h1>
      <TransactionTable transactions={txs} />
    </div>
  );
}