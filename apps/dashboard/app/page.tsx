// apps/dashboard/app/page.tsx
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
        MPC Custodial Wallet</h1>
      <p className="text-slate-300 max-w-xl text-center">
        2-of-3 Threshold MPC wallet powered by Hedera Hashgraph. Secure,
        programmable, audit-ready custody for serious infrastructure.
      </p>
      <div className="flex gap-4">
        <Link
          href="/(auth)/login"
          className="rounded-xl px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold transition"
        >
          Login
        </Link>
        <Link
          href="/(dashboard)"
          className="rounded-xl px-6 py-3 border border-slate-600 hover:border-slate-400 font-medium"
        >
          View Dashboard (dev mode)
        </Link>
      </div>
    </main>
  );
}