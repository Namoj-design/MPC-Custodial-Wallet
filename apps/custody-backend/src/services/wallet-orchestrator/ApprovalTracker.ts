import { ParticipantRole } from '../../mpc/types.js';

/**
 * Approval tracking for 2-of-3 threshold policy
 */
export class ApprovalTracker {
    private approvals: Map<string, Set<ParticipantRole>> = new Map();

    /**
     * Add approval for an intent
     */
    addApproval(intentId: string, approver: ParticipantRole): void {
        if (!this.approvals.has(intentId)) {
            this.approvals.set(intentId, new Set());
        }

        const intentApprovals = this.approvals.get(intentId)!;

        if (intentApprovals.has(approver)) {
            throw new Error(`${approver} has already approved intent ${intentId}`);
        }

        intentApprovals.add(approver);
    }

    /**
     * Get approval count for an intent
     */
    getApprovalCount(intentId: string): number {
        const approvals = this.approvals.get(intentId);
        return approvals ? approvals.size : 0;
    }

    /**
     * Check if threshold is reached (2-of-3)
     */
    hasThreshold(intentId: string, threshold: number = 2): boolean {
        return this.getApprovalCount(intentId) >= threshold;
    }

    /**
     * Get list of approvers for an intent
     */
    getApprovers(intentId: string): ParticipantRole[] {
        const approvals = this.approvals.get(intentId);
        return approvals ? Array.from(approvals) : [];
    }

    /**
     * Check if a specific role has approved
     */
    hasApproved(intentId: string, role: ParticipantRole): boolean {
        const approvals = this.approvals.get(intentId);
        return approvals ? approvals.has(role) : false;
    }

    /**
     * Clear approvals for an intent
     */
    clear(intentId: string): void {
        this.approvals.delete(intentId);
    }
}
