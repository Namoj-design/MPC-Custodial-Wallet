"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function HomePage() {
  const [txCount, setTxCount] = useState(12890);
  const [userCount, setUserCount] = useState(420);

  // Fake live counter animation
  useEffect(() => {
    const interval = setInterval(() => {
      setTxCount((n) => n + Math.floor(Math.random() * 7));
      setUserCount((n) => n + Math.floor(Math.random() * 2));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-purple-700/10 to-transparent animate-pulse"></div>

      {/* Animated circles */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.3, scale: 1.2 }}
        transition={{ duration: 6, repeat: Infinity, repeatType: "reverse" }}
        className="absolute top-1/4 left-1/3 h-80 w-80 rounded-full bg-purple-700/20 blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 0.25, scale: 1 }}
        transition={{ duration: 7, repeat: Infinity, repeatType: "reverse" }}
        className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl"
      />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 pt-32 text-center">
        
        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl font-bold md:text-6xl"
        >
          Secure MPC Custodial Wallet  
          <span className="bg-gradient-to-r from-purple-500 to-indigo-400 bg-clip-text text-transparent">
            {" "}
          </span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mt-6 max-w-2xl text-lg text-gray-300"
        >
          Experience real-time Hedera-powered transactions with multi-party 
          computation, enterprise-grade orchestration, ultra-low latency, and 
          complete transparency.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          className="mt-8 flex gap-5"
        >
          <a
            href="/login"
            className="rounded-lg bg-indigo-600 px-6 py-3 text-lg font-semibold transition hover:bg-indigo-700"
          >
            Launch Dashboard
          </a>

          <a
            href="/docs"
            className="rounded-lg border border-gray-400 px-6 py-3 text-lg font-semibold transition hover:bg-white/10"
          >
            API Docs
          </a>
        </motion.div>

        {/* Stats Section */}
        <div className="mt-20 grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
          
          {/* Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="rounded-xl bg-white/5 p-6 backdrop-blur-xl"
          >
            <p className="text-4xl font-bold">{txCount.toLocaleString()}</p>
            <p className="mt-2 text-sm text-gray-300">Transactions Signed</p>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="rounded-xl bg-white/5 p-6 backdrop-blur-xl"
          >
            <p className="text-4xl font-bold">{userCount.toLocaleString()}</p>
            <p className="mt-2 text-sm text-gray-300">Active Wallets</p>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4 }}
            className="rounded-xl bg-white/5 p-6 backdrop-blur-xl"
          >
            <p className="text-4xl font-bold">99.99%</p>
            <p className="mt-2 text-sm text-gray-300">System Uptime</p>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-5 w-full text-center text-sm text-gray-400">
        © {new Date().getFullYear()} MPC Hashgraph Wallet • Built for scalable digital finance
      </div>
    </div>
  );
}