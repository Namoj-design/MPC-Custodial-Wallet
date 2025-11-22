import React from "react";

// apps/dashboard/components/TransactionTable.tsx
interface Transaction {
    id: string;
    from: string;
    to: string;
    amount: string;
    status: string;
    createdAt: string;
  }
  
  interface Props {
    transactions: Transaction[];
  }
  
  export function TransactionTable({ transactions }: Props) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-100">
            Recent Transactions
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs md:text-sm">
            <thead className="text-slate-400 border-b border-slate-800">
              <tr>
                <th className="text-left py-2 pr-2">TX ID</th>
                <th className="text-left py-2 pr-2">From</th>
                <th className="text-left py-2 pr-2">To</th>
                <th className="text-right py-2 pr-2">Amount (ℏ)</th>
                <th className="text-left py-2 pr-2">Status</th>
                <th className="text-left py-2 pr-2">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="py-2 pr-2 font-mono text-[11px] text-slate-300">
                    {tx.id.slice(0, 10)}...
                  </td>
                  <td className="py-2 pr-2 text-slate-200">{tx.from}</td>
                  <td className="py-2 pr-2 text-slate-200">{tx.to}</td>
                  <td className="py-2 pr-2 text-right text-emerald-300">
                    {tx.amount}
                  </td>
                  <td className="py-2 pr-2">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] ${
                        tx.status === "SUCCESS"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : tx.status === "PENDING"
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-red-500/20 text-red-300"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-2 pr-2 text-slate-400">{tx.createdAt}</td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-6 text-center text-slate-500 text-xs"
                  >
                    No recent transactions yet. Trigger one from your backend or
                    workers.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }