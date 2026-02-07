import { transactionRepo } from '../../services/container.js';

export class TransactionController {
    /**
     * Get transaction status
     */
    async getTransactionStatus(txId: string): Promise<any> {
        const tx = transactionRepo.findById(txId);

        if (!tx) {
            return null;
        }

        return {
            transaction: {
                id: tx.id,
                intentId: tx.intentId,
                hederaTxId: tx.hederaTxId,
                status: tx.status,
                submittedAt: tx.submittedAt,
                confirmedAt: tx.confirmedAt,
                error: tx.error
            }
        };
    }
}
