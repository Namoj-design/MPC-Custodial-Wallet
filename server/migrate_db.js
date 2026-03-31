require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function migrate() {
  await client.connect();
  console.log('Connected to PostgreSQL for explicit migration.');

  try {
    // 1. ALTER Transaction Table
    await client.query(`
      ALTER TABLE "Transaction"
      RENAME COLUMN signature_hex TO final_signature;
    `).catch(e => console.log('Rename signature_hex failed (might already be renamed)'));

    await client.query(`
      ALTER TABLE "Transaction"
      RENAME COLUMN tx_hash TO hedera_tx_id;
    `).catch(e => console.log('Rename tx_hash failed'));

    await client.query(`
      ALTER TABLE "Transaction"
      ADD COLUMN IF NOT EXISTS created_by TEXT NOT NULL DEFAULT 'SYSTEM',
      ADD COLUMN IF NOT EXISTS approved_by TEXT,
      ADD COLUMN IF NOT EXISTS dfns_signature_id TEXT;
    `);
    console.log('Altered Transaction table successfully.');

    // 2. CREATE AuditLog Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "AuditLog" (
        "id" TEXT NOT NULL,
        "transaction_id" TEXT NOT NULL,
        "client_id" TEXT NOT NULL,
        "manager_id" TEXT NOT NULL,
        "signature" TEXT NOT NULL,
        "hedera_tx_id" TEXT NOT NULL,
        "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
      );
    `);
    
    // Attempt to add foreign key if it does not exist
    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AuditLog_transaction_id_fkey') THEN
          ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
        END IF;
      END $$;
    `).catch(e => console.log('Foreign key creation ignored', e.message));

    console.log('Created AuditLog table successfully.');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await client.end();
  }
}

migrate();
