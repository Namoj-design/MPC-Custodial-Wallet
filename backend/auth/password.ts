// backend/auth/password.ts

import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

// Optional: Add pepper for extra security
const PEPPER = process.env.PASSWORD_PEPPER || "";

export async function hashPassword(password: string): Promise<string> {
  const combined = password + PEPPER;
  return bcrypt.hash(combined, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const combined = password + PEPPER;
  return bcrypt.compare(combined, hash);
}