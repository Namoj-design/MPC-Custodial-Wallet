

import {
  Client,
  Transaction,
  TransactionReceipt,
} from "@hashgraph/sdk";

/**
 * Result of a Hedera transaction execution
 */
export type ExecutionResult = {
  transactionId: string;
  status: string;
};

/**
 * Submit an already-signed Hedera transaction to the network
 * and wait for consensus receipt.
 *
 * IMPORTANT:
 * - The transaction bytes MUST already be frozen and signed.
 * - This function performs NO validation, NO policy checks.
 */
export async function executeSignedTransaction(params: {
  signedBytes: Uint8Array;
  client: Client;
}): Promise<ExecutionResult> {
  // Reconstruct transaction from signed bytes
  const transaction = Transaction.fromBytes(params.signedBytes);

  // Execute transaction on Hedera
  const response = await transaction.execute(params.client);

  // Wait for consensus receipt
  const receipt: TransactionReceipt = await response.getReceipt(
    params.client
  );

  return {
    transactionId: response.transactionId.toString(),
    status: receipt.status.toString(),
  };
}