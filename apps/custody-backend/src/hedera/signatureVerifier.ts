import {
  Transaction,
  PublicKey,
} from "@hashgraph/sdk";

/**
 * Verify a signed Hedera transaction against an expected public key.
 *
 * This uses Hedera SDK native verification and does NOT
 * attempt to manually inspect signature maps.
 */
export function verifySignedTransaction(params: {
  signedBytes: Uint8Array;
  expectedPublicKey: string;
}): boolean {
  const tx = Transaction.fromBytes(params.signedBytes);

  const publicKey = PublicKey.fromString(params.expectedPublicKey);

  // Hedera SDK handles signature map verification internally
  return publicKey.verifyTransaction(tx);
}