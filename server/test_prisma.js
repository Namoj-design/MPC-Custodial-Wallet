const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function testUrl(url) {
  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  
  try {
    const txs = await prisma.transaction.findMany();
    console.log("SUCCESS WITH URL:", url);
    console.log("Transactions:", JSON.stringify(txs, null, 2));
    return true;
  } catch (e) {
    console.error("FAIL WITH URL:", url, "| Error:", e.name, e.code);
    return false;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

async function runTests() {
  const tests = [
    'postgresql://localhost:5432/postgres?schema=public',
    'postgresql://namojperiakumar@localhost:5432/postgres?schema=public',
    'postgresql://postgres@localhost:5432/postgres?schema=public',
    'postgresql://namojperiakumar:password@localhost:5432/postgres?schema=public'
  ];
  for (const url of tests) {
    const success = await testUrl(url);
    if (success) {
      console.log('BEST URL IS:', url);
      process.exit(0);
    }
  }
  process.exit(1);
}
runTests();
