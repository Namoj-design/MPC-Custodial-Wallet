import {
    AccountCreateTransaction,
    PublicKey,
    Hbar,
  } from "@hashgraph/sdk";
  import { createHederaClient } from "./client.ts";
  
  /**
   * Creates a Hedera account controlled by an MPC public key
   */
  export async function createMpcAccount(
    mpcPublicKeyBytes: Uint8Array
  ) {
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