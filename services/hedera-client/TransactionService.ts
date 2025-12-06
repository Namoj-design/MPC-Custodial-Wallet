import {
    TransferTransaction,
    Hbar,
    TransactionReceipt,
  } from "@hashgraph/sdk";
  import { HederaClient } from "./HederaClient";
  export interface TransactionResult {
    success: boolean;
    status?: string;
    transactionId?: string;
    error?: string;
  }
   
  export class TransactionService {
    constructor(private hedera: HederaClient) {}
  
    async submitTransaction(
      from: string,
      to: string,
      amountHbar: string
    ): Promise<TransactionResult> {
      try {
        const tx = new TransferTransaction()
          .addHbarTransfer(from, Hbar.fromString(`-${amountHbar}`))
          .addHbarTransfer(to, Hbar.fromString(amountHbar))
          .freezeWith(this.hedera.getClient());
  
        const signed = await tx.signWithOperator(this.hedera.getClient());
        const response = await signed.execute(this.hedera.getClient());
        const receipt: TransactionReceipt = await response.getReceipt(
          this.hedera.getClient()
        );
  
        return {
          success: true,
          status: receipt.status.toString(),
          transactionId: response.transactionId.toString(),
        };
      } catch (err) {
        return { success: false, error: String(err) };
      }
    }
  }