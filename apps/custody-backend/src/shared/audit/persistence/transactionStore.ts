/**
 * Execution status persisted for a transaction intent
 */
export type StoredTransactionRecord = {
    intentId: string;
    transactionId?: string;
    status: "PENDING" | "SUBMITTED" | "CONFIRMED" | "FAILED";
    updatedAt: number;
  };
  
  /**
   * In-memory transaction store (MVP).
   * Designed to be replaced with DB implementation later.
   */
  class TransactionStore {
    private store = new Map<string, StoredTransactionRecord>();
  
    /**
     * Initialize a transaction record when execution starts
     */
    create(intentId: string): StoredTransactionRecord {
      if (this.store.has(intentId)) {
        throw new Error("TRANSACTION_ALREADY_EXISTS");
      }
  
      const record: StoredTransactionRecord = {
        intentId,
        status: "PENDING",
        updatedAt: Date.now(),
      };
  
      this.store.set(intentId, record);
      return record;
    }
  
    /**
     * Mark transaction as submitted to Hedera
     */
    markSubmitted(
      intentId: string,
      transactionId: string
    ): StoredTransactionRecord {
      const record = this.get(intentId);
  
      record.transactionId = transactionId;
      record.status = "SUBMITTED";
      record.updatedAt = Date.now();
  
      return record;
    }
  
    /**
     * Mark transaction as confirmed
     */
    markConfirmed(intentId: string): StoredTransactionRecord {
      const record = this.get(intentId);
  
      record.status = "CONFIRMED";
      record.updatedAt = Date.now();
  
      return record;
    }
  
    /**
     * Mark transaction as failed
     */
    markFailed(intentId: string): StoredTransactionRecord {
      const record = this.get(intentId);
  
      record.status = "FAILED";
      record.updatedAt = Date.now();
  
      return record;
    }
  
    /**
     * Fetch transaction record
     */
    get(intentId: string): StoredTransactionRecord {
      const record = this.store.get(intentId);
      if (!record) {
        throw new Error("TRANSACTION_NOT_FOUND");
      }
      return record;
    }
  }
  
  export const transactionStore = new TransactionStore();
  