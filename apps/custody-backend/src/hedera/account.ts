import {
  AccountCreateTransaction,
  PublicKey,
  Hbar,
} from "@hashgraph/sdk";

import { createHederaClient } from "./client.ts";

/**
 * Create a Hedera account controlled by an MPC public key.
 *
 * IMPORTANT:
 * - No signatures are produced here
 * - No MPC signing occurs at account creation time
 * - This function ONLY binds an MPC public key as the account key
 *
 * All transaction signing + verification happens elsewhere.
 */
export async function createMpcAccount(
  mpcPublicKeyBytes: Uint8Array
) {
  // Basic sanity check (Ed25519 public key length)
  if (mpcPublicKeyBytes.length !== 32) {
    throw new Error("INVALID_MPC_PUBLIC_KEY");
  }

  const client = createHederaClient();

  const publicKey = PublicKey.fromBytes(mpcPublicKeyBytes);

  const tx = await new AccountCreateTransaction()
    .setKey(publicKey)
    .setInitialBalance(new Hbar(5)) // testnet balance
    .execute(client);

  const receipt = await tx.getReceipt(client);

  return {
    accountId: receipt.accountId?.toString(),
    status: receipt.status.toString(),
  };
}