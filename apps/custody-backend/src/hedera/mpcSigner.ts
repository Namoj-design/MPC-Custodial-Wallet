import {
    TransferTransaction,
    PublicKey,
    AccountId,
  } from "@hashgraph/sdk";
  import { createHederaClient } from "./client.ts";
  
  export async function signAndSubmitTransferTx(
    mpcPublicKeyBytes: Uint8Array,
    mpcSignature: Uint8Array,
    fromAccount: string,
    toAccount: string,
    amountTinybar: number
  ) {
    const client = createHederaClient();
  
    const tx = await new TransferTransaction()
      .addHbarTransfer(AccountId.fromString(fromAccount), -amountTinybar)
      .addHbarTransfer(AccountId.fromString(toAccount), amountTinybar)
      .freezeWith(client);
  
    // Attach MPC signature
    tx.addSignature(
      PublicKey.fromBytes(mpcPublicKeyBytes),
      mpcSignature
    );
  
    const response = await tx.execute(client);
    const receipt = await response.getReceipt(client);
  
    return {
      transactionId: response.transactionId?.toString(),
      status: receipt.status.toString(),
    };
  }