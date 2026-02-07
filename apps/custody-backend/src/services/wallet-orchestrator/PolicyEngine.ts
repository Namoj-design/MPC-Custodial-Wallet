import { validateHederaAccountId, validateHBARAmount, validateMemo } from '../../shared/utils/validation.js';
import { ParticipantRole } from '../../mpc/types.js';

/**
 * Policy engine for validating business rules
 */
export class PolicyEngine {
    private readonly MAX_HBAR_PER_TX = 10000; // Configurable limit
    private readonly MAX_MEMO_LENGTH = 100;
    private readonly VALID_ROLES = new Set([
        ParticipantRole.CLIENT,
        ParticipantRole.WEALTH_MANAGER,
        ParticipantRole.BACKEND_CUSTODY
    ]);

    /**
     * Validate intent creation
     */
    validateIntent(recipientAccountId: string, amountHBAR: string, memo: string): void {
        // Validate recipient account ID
        validateHederaAccountId(recipientAccountId);

        // Validate amount
        validateHBARAmount(amountHBAR);
        const amount = parseFloat(amountHBAR);
        if (amount > this.MAX_HBAR_PER_TX) {
            throw new Error(`Amount exceeds maximum allowed: ${this.MAX_HBAR_PER_TX} HBAR`);
        }

        // Validate memo
        validateMemo(memo);
        if (memo.length > this.MAX_MEMO_LENGTH) {
            throw new Error(`Memo exceeds maximum length: ${this.MAX_MEMO_LENGTH} characters`);
        }
    }

    /**
     * Validate participant authorization
     */
    validateParticipant(role: ParticipantRole): void {
        if (!this.VALID_ROLES.has(role)) {
            throw new Error(`Invalid participant role: ${role}`);
        }
    }

    /**
     * Validate approval threshold
     */
    validateApprovalThreshold(approvalCount: number, requiredThreshold: number = 2): boolean {
        return approvalCount >= requiredThreshold;
    }

    /**
     * Check if participant can approve
     */
    canApprove(role: ParticipantRole): boolean {
        return this.VALID_ROLES.has(role);
    }

    /**
     * Validate session participants (need at least 2 for 2-of-3)
     */
    validateSessionParticipants(participantCount: number): void {
        if (participantCount < 2) {
            throw new Error('Need at least 2 participants for signing');
        }
        if (participantCount > 3) {
            throw new Error('Maximum 3 participants allowed');
        }
    }
}
