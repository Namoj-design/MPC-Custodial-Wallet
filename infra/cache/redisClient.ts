import Redis from "ioredis";
import { infrastructureConfig } from "/Users/namojperiakumar/Desktop/MPC-Wallet/infra/config/infrastructureConfig.ts";

const redis = new Redis(infrastructureConfig.redisUrl, {
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

redis.on("connect", () => {
  console.log("🔌 Redis connected");
});

redis.on("error", (err) => {
  console.error("Redis error:", err.message);
});

export default redis;