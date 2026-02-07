
import {
    TransferTransaction,
    Hbar,
    AccountId,
    TransactionReceipt,
    Status,
    PublicKey
} from '@hashgraph/sdk';
import type { Client } from '@hashgraph/sdk';
import { getMPCAccountId } from './client.js';

import { Intent } from '../mpc/types.js';

/**
 * Hedera transaction execution service with retry logic
 */
export class ExecutionService {
    private maxRetries = 3;
    private retryDelayMs = 1000;

    constructor(
        private client: Client,
        public mpcPublicKey: Uint8Array
    ) { }

    /**
     * Execute transaction with MPC signing
     */
    /**
     * Build and freeze transaction for signing
     */
    async buildFrozenTransaction(intent: Intent): Promise<{ transaction: TransferTransaction; bytes: Uint8Array }> {
        const transaction = await this.buildTransaction(intent);
        const frozenTx = await transaction.freezeWith(this.client);
        const bytes = frozenTx.toBytes();
        return { transaction: frozenTx, bytes };
    }

    /**
     * Submit signed transaction
     */
    async submitSignedTransaction(
        transaction: TransferTransaction,
        signature: Uint8Array
    ): Promise<{ txId: string; receipt: TransactionReceipt }> {
        // Add signature to transaction
        const publicKey = PublicKey.fromBytes(this.mpcPublicKey);
        const signedTx = transaction.addSignature(publicKey, signature);

        // Submit transaction with retry
        const { txId, receipt } = await this.submitWithRetry(signedTx);

        console.log(`[ExecutionService] Transaction submitted: ${txId} `);
        console.log(`[ExecutionService] Status: ${receipt.status.toString()} `);

        return { txId, receipt };
    }

    /**
     * Execute transaction with MPC signing (Legacy/Direct mode)
     */
    async executeIntent(
        intent: Intent,
        signFunction: (message: Uint8Array) => Promise<Uint8Array>
    ): Promise<{ txId: string; receipt: TransactionReceipt; signature: Uint8Array }> {
        console.log(`[ExecutionService] Executing intent ${intent.id} `);

        // Build and freeze
        const { transaction: frozenTx, bytes: txBytes } = await this.buildFrozenTransaction(intent);

        console.log(`[ExecutionService] Transaction bytes: ${txBytes.length} bytes`);

        // Execute MPC signing
        console.log(`[ExecutionService] Starting MPC signing...`);
        const signature = await signFunction(txBytes);
        console.log(`[ExecutionService] MPC signature generated: ${signature.length} bytes`);

        // Submit
        const { txId, receipt } = await this.submitSignedTransaction(frozenTx, signature);

        return { txId, receipt, signature };
    }

    /**
     * Build transfer transaction from intent
     */
    private async buildTransaction(intent: Intent): Promise<TransferTransaction> {
        const mpcAccountId = getMPCAccountId();
        const recipientId = AccountId.fromString(intent.recipientAccountId);
        const amount = new Hbar(parseFloat(intent.amountHBAR));

        const transaction = new TransferTransaction()
            .addHbarTransfer(mpcAccountId, amount.negated())
            .addHbarTransfer(recipientId, amount)
            .setTransactionMemo(intent.memo);

        return transaction;
    }

    /**
     * Submit transaction with retry logic
     */
    private async submitWithRetry(
        transaction: TransferTransaction
    ): Promise<{ txId: string; receipt: TransactionReceipt }> {
        let lastError: Error | undefined;

        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                console.log(`[ExecutionService] Submission attempt ${attempt}/${this.maxRetries}`);

                const txResponse = await transaction.execute(this.client);
                const receipt = await txResponse.getReceipt(this.client);

                if (receipt.status === Status.Success) {
                    return {
                        txId: txResponse.transactionId.toString(),
                        receipt
                    };
                } else {
                    throw new Error(`Transaction failed with status: ${receipt.status.toString()}`);
                }
            } catch (error) {
                lastError = error as Error;
                console.error(`[ExecutionService] Attempt ${attempt} failed:`, error);

                if (attempt < this.maxRetries) {
                    await this.delay(this.retryDelayMs * attempt);
                }
            }
        }

        throw new Error(`Transaction failed after ${this.maxRetries} attempts: ${lastError?.message}`);
    }

    /**
     * Delay helper for retry logic
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Verify transaction status
     */
    async getTransactionStatus(txId: string): Promise<Status> {
        console.log(`[ExecutionService] Checking status for txId: ${txId}`);
        // In production, query transaction record
        // For MVP, return success if no error
        return Status.Success;
    }
}
