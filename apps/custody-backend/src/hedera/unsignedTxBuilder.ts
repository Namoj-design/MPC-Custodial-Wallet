import {
    TransferTransaction,
    AccountId,
    Client,
  } from "@hashgraph/sdk";
  
  /**
   * Build an unsigned Hedera transfer transaction
   * and return serialized bytes for client signing.
   */
  export async function buildUnsignedTransferTx(params: {
    fromAccount: string;
    toAccount: string;
    amountTinybar: number;
    client: Client;
  }): Promise<Uint8Array> {
    const tx = await new TransferTransaction()
      .addHbarTransfer(
        AccountId.fromString(params.fromAccount),
        -params.amountTinybar
      )
      .addHbarTransfer(
        AccountId.fromString(params.toAccount),
        params.amountTinybar
      )
      .freezeWith(params.client);
  
    return tx.toBytes();
  }