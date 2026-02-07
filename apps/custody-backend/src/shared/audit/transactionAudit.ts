import { AuditRepository } from '../../storage/AuditRepository.js';
import { ParticipantRole } from '../../mpc/types.js';

/**
 * Transaction lifecycle audit logging
 */
export class TransactionAudit {
    constructor(private auditRepo: AuditRepository) { }

    logIntentCreated(intentId: string, actorId: string, recipientAccountId: string, amountHBAR: string): void {
        this.auditRepo.log({
            intentId,
            actorId,
            action: 'INTENT_CREATED',
            metadata: { recipientAccountId, amountHBAR }
        });
    }

    logApprovalReceived(intentId: string, approver: ParticipantRole): void {
        this.auditRepo.log({
            intentId,
            actorId: approver,
            action: 'APPROVAL_RECEIVED',
            metadata: { approver }
        });
    }

    logExecutionStarted(intentId: string, sessionId: string): void {
        this.auditRepo.log({
            intentId,
            sessionId,
            action: 'EXECUTION_STARTED',
            metadata: {}
        });
    }

    logTransactionSubmitted(intentId: string, hederaTxId: string, signature: string): void {
        this.auditRepo.log({
            intentId,
            action: 'TRANSACTION_SUBMITTED',
            metadata: { hederaTxId, signature }
        });
    }

    logTransactionConfirmed(intentId: string, hederaTxId: string, status: string): void {
        this.auditRepo.log({
            intentId,
            action: 'TRANSACTION_CONFIRMED',
            metadata: { hederaTxId, status }
        });
    }

    logTransactionFailed(intentId: string, error: string): void {
        this.auditRepo.log({
            intentId,
            action: 'TRANSACTION_FAILED',
            metadata: { error }
        });
    }

    logIntentStatusChanged(intentId: string, oldStatus: string, newStatus: string): void {
        this.auditRepo.log({
            intentId,
            action: 'INTENT_STATUS_CHANGED',
            metadata: { oldStatus, newStatus }
        });
    }
}
