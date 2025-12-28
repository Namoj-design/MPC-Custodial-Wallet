

/**
 * Execution audit record.
 * Immutable, append-only.
 */
export type ExecutionAuditRecord = {
  intentId: string;
  transactionId: string;
  submittedAt: number;
  confirmedAt?: number;
  status: "SUBMITTED" | "CONFIRMED" | "FAILED";
};

/**
 * In-memory execution audit log (MVP).
 * Designed to be replaced by WORM / DB storage later.
 */
class ExecutionAudit {
  private records: ExecutionAuditRecord[] = [];

  /**
   * Record transaction submission to Hedera
   */
  recordSubmission(params: {
    intentId: string;
    transactionId: string;
  }): void {
    const record: ExecutionAuditRecord = {
      intentId: params.intentId,
      transactionId: params.transactionId,
      submittedAt: Date.now(),
      status: "SUBMITTED",
    };

    this.records.push(Object.freeze(record));
  }

  /**
   * Record transaction confirmation
   */
  recordConfirmation(params: {
    intentId: string;
    transactionId: string;
  }): void {
    const record: ExecutionAuditRecord = {
      intentId: params.intentId,
      transactionId: params.transactionId,
      submittedAt: Date.now(),
      confirmedAt: Date.now(),
      status: "CONFIRMED",
    };

    this.records.push(Object.freeze(record));
  }

  /**
   * Record execution failure
   */
  recordFailure(params: {
    intentId: string;
    transactionId: string;
  }): void {
    const record: ExecutionAuditRecord = {
      intentId: params.intentId,
      transactionId: params.transactionId,
      submittedAt: Date.now(),
      status: "FAILED",
    };

    this.records.push(Object.freeze(record));
  }

  /**
   * Retrieve audit records for an intent
   */
  getByIntent(intentId: string): ExecutionAuditRecord[] {
    return this.records.filter(
      (r) => r.intentId === intentId
    );
  }
}

export const executionAudit = new ExecutionAudit();