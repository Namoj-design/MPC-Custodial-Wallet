import { TransactionRecord } from '../mpc/types.js';
import { randomBytes } from 'crypto';

/**
 * In-memory transaction repository (DB-ready architecture)
 */
export class TransactionRepository {
    private transactions: Map<string, TransactionRecord> = new Map();

    create(intentId: string): TransactionRecord {
        const tx: TransactionRecord = {
            id: this.generateId(),
            intentId,
            status: 'PENDING'
        };

        this.transactions.set(tx.id, tx);
        return tx;
    }

    findById(id: string): TransactionRecord | undefined {
        return this.transactions.get(id);
    }

    findByIntentId(intentId: string): TransactionRecord | undefined {
        return Array.from(this.transactions.values()).find(tx => tx.intentId === intentId);
    }

    update(id: string, updates: Partial<TransactionRecord>): TransactionRecord | undefined {
        const tx = this.transactions.get(id);
        if (!tx) {
            return undefined;
        }

        const updated = { ...tx, ...updates };
        this.transactions.set(id, updated);
        return updated;
    }

    markSubmitted(id: string, hederaTxId: string, signature: Uint8Array): TransactionRecord | undefined {
        return this.update(id, {
            status: 'SUBMITTED',
            hederaTxId,
            signature,
            submittedAt: new Date()
        });
    }

    markSuccess(id: string, receipt: unknown): TransactionRecord | undefined {
        return this.update(id, {
            status: 'SUCCESS',
            receipt,
            confirmedAt: new Date()
        });
    }

    markFailed(id: string, error: string): TransactionRecord | undefined {
        return this.update(id, {
            status: 'FAILED',
            error
        });
    }

    list(): TransactionRecord[] {
        return Array.from(this.transactions.values());
    }

    private generateId(): string {
        return `tx_${randomBytes(16).toString('hex')}`;
    }
}
