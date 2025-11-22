// apps/dashboard/app/layout.tsx
import "../styles/globals.css";
import React, { ReactNode } from "react";

export const metadata = {
  title: "MPC Custodial Wallet Dashboard",
  description: "Enterprise-grade MPC 2-of-3 custodial wallet on Hedera",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-50 antialiased">
        {children}
      </body>
    </html>
  );
}