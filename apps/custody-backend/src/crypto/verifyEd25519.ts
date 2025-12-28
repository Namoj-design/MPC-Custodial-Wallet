// src/crypto/verifyEd25519.ts

import * as ed from "@noble/ed25519";

/**
 * Verify an Ed25519 signature locally.
 *
 * @param message   Raw message bytes that were signed
 * @param signature 64-byte Ed25519 signature (R || s)
 * @param publicKey 32-byte Ed25519 public key
 *
 * @returns true if valid, false otherwise
 */
export async function verifyEd25519Signature(
  message: Uint8Array,
  signature: Uint8Array,
  publicKey: Uint8Array
): Promise<boolean> {
  // Basic sanity checks — fail fast
  if (signature.length !== 64) {
    throw new Error("Invalid signature length");
  }

  if (publicKey.length !== 32) {
    throw new Error("Invalid public key length");
  }

  try {
    return await ed.verify(signature, message, publicKey);
  } catch (err) {
    return false;
  }
}