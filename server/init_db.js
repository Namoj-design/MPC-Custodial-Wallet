const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://localhost:5432/postgres' });

async function init() {
  const sql = `
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL,
  "firebase_uid" TEXT,
  "email" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'NONE',
  "dfns_user_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_firebase_uid_key" ON "User"("firebase_uid");
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "User_dfns_user_id_key" ON "User"("dfns_user_id");

CREATE TABLE IF NOT EXISTS "Wallet" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "dfns_wallet_id" TEXT NOT NULL,
  "hedera_address" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Wallet_dfns_wallet_id_key" ON "Wallet"("dfns_wallet_id");

CREATE TABLE IF NOT EXISTS "Transaction" (
  "id" TEXT NOT NULL,
  "sender_wallet_id" TEXT NOT NULL,
  "receiver_address" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "status" TEXT NOT NULL,
  "signature_hex" TEXT,
  "tx_hash" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Otp" (
  "email" TEXT NOT NULL,
  "otp" TEXT NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Otp_pkey" PRIMARY KEY ("email")
);
  `;
  try {
    await pool.query(sql);
    console.log("Database initialized successfully!");
  } catch (error) {
    console.error("Initialization failed:", error);
  } finally {
    await pool.end();
  }
}

init();
