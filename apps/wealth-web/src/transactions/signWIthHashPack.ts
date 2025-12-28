import { hashPack } from "../wallet/hashpack.ts";

/**
 * Sign an unsigned Hedera transaction using HashPack
 */
export async function signTransactionWithHashPack(
  unsignedTxBytes: Uint8Array
): Promise<{
  signedBytes: Uint8Array;
  signatureMap: Uint8Array;
}> {
  return await hashPack.signTransactionBytes(unsignedTxBytes);
}