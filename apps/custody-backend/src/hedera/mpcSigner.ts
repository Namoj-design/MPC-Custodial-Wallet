import {
  TransferTransaction,
  PublicKey,
  AccountId,
} from "@hashgraph/sdk";

import { createHederaClient } from "./client.ts";
import { verifyEd25519Signature } from "../crypto/verifyEd25519.ts";

/**
 * Sign and submit a Hedera transfer transaction using an MPC-produced Ed25519 signature.
 * The signature is VERIFIED locally before submission.
 */
export async function signAndSubmitTransferTx(
  mpcPublicKeyBytes: Uint8Array,
  mpcSignature: Uint8Array,
  messageBytes: Uint8Array,
  fromAccount: string,
  toAccount: string,
  amountTinybar: number
) {
  // 🔐 STEP 1: Verify MPC signature locally
  const isValid = await verifyEd25519Signature(
    messageBytes,
    mpcSignature,
    mpcPublicKeyBytes
  );

  if (!isValid) {
    throw new Error("INVALID_MPC_SIGNATURE");
  }

  // 🔗 STEP 2: Create Hedera client
  const client = createHederaClient();

  // 🧾 STEP 3: Build transaction
  const tx = await new TransferTransaction()
    .addHbarTransfer(AccountId.fromString(fromAccount), -amountTinybar)
    .addHbarTransfer(AccountId.fromString(toAccount), amountTinybar)
    .freezeWith(client);

  // ✍️ STEP 4: Attach verified MPC signature
  tx.addSignature(
    PublicKey.fromBytes(mpcPublicKeyBytes),
    mpcSignature
  );

  // 🚀 STEP 5: Submit transaction
  const response = await tx.execute(client);
  const receipt = await response.getReceipt(client);

  return {
    transactionId: response.transactionId?.toString(),
    status: receipt.status.toString(),
  };
}

import { verifySignedTransaction } from "./signatureVerifier";

/**
 * Verify a client (HashPack) signature before recording approval.
 * This does NOT submit or mutate the transaction.
 */
export function verifyClientSignature(params: {
  signedBytes: Uint8Array;
  clientPublicKey: string;
}): void {
  const isValid = verifySignedTransaction({
    signedBytes: params.signedBytes,
    expectedPublicKey: params.clientPublicKey,
  });

  if (!isValid) {
    throw new Error("INVALID_CLIENT_SIGNATURE");
  }
}