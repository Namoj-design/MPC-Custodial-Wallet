import mongoose from "mongoose";
import { infrastructureConfig } from "/Users/namojperiakumar/Desktop/MPC-Wallet/infra/config/infrastructureConfig.ts";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(infrastructureConfig.mongodb.uri, {
      dbName: "mpc_wallet",
    });

    isConnected = true;
    console.log(`📦 MongoDB connected: ${conn.connection.host}`);
  } catch (err: any) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};