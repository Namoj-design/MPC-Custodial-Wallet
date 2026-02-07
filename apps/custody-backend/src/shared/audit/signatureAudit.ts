import { AuditRepository } from '../../storage/AuditRepository.js';

/**
 * Signature-specific audit logging
 */
export class SignatureAudit {
    constructor(private auditRepo: AuditRepository) { }

    logNonceCommitReceived(sessionId: string, actorId: string, commitment: string): void {
        this.auditRepo.log({
            sessionId,
            actorId,
            action: 'NONCE_COMMIT_RECEIVED',
            metadata: { commitment }
        });
    }

    logNonceRevealReceived(sessionId: string, actorId: string, nonce: string): void {
        this.auditRepo.log({
            sessionId,
            actorId,
            action: 'NONCE_REVEAL_RECEIVED',
            metadata: { nonce }
        });
    }

    logPartialSignatureReceived(sessionId: string, actorId: string, partialSig: string): void {
        this.auditRepo.log({
            sessionId,
            actorId,
            action: 'PARTIAL_SIGNATURE_RECEIVED',
            metadata: { partialSig }
        });
    }

    logSignatureVerified(sessionId: string, intentId: string, signature: string, valid: boolean): void {
        this.auditRepo.log({
            sessionId,
            intentId,
            action: 'SIGNATURE_VERIFIED',
            metadata: { signature, valid }
        });
    }

    logSignatureAggregated(sessionId: string, intentId: string, signature: string): void {
        this.auditRepo.log({
            sessionId,
            intentId,
            action: 'SIGNATURE_AGGREGATED',
            metadata: { signature }
        });
    }

    logSigningRoundStarted(sessionId: string, intentId: string, round: string): void {
        this.auditRepo.log({
            sessionId,
            intentId,
            action: 'SIGNING_ROUND_STARTED',
            metadata: { round }
        });
    }

    logSigningFailed(sessionId: string, intentId: string, error: string): void {
        this.auditRepo.log({
            sessionId,
            intentId,
            action: 'SIGNING_FAILED',
            metadata: { error }
        });
    }
}
