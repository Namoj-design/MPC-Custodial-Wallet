import { ApprovalRole, Approval, ThresholdResult, TwoOfThreeCustodyPolicy } from "/Users/namojperiakumar/Desktop/MPC-Custodial-Wallet/apps/custody-backend/src/shared/threshold/thresholdPolicy.ts";

/**
 * Tracks approvals for a single transaction intent.
 *
 * Responsibilities:
 * - Store approvals by role
 * - Prevent duplicate approvals
 * - Evaluate threshold satisfaction (2-of-3)
 *
 * NOTE:
 * - No crypto verification here
 * - No Hedera submission here
 * - Pure orchestration logic
 */
export class ApprovalTracker {
  private readonly intentId: string;
  private approvals: Map<ApprovalRole, Approval> = new Map();

  constructor(intentId: string) {
    if (!intentId) {
      throw new Error("INTENT_ID_REQUIRED");
    }
    this.intentId = intentId;
  }

  /**
   * Record an approval from a role.
   * Duplicate approvals from the same role are ignored.
   */
  addApproval(role: ApprovalRole): ThresholdResult {
    if (!this.approvals.has(role)) {
      this.approvals.set(role, {
        role,
        approvedAt: new Date().toISOString(),
      });
    }

    return this.evaluate();
  }

  /**
   * Get all current approvals.
   */
  getApprovals(): Approval[] {
    return Array.from(this.approvals.values());
  }

  /**
   * Evaluate the threshold policy.
   */
  evaluate(): ThresholdResult {
    return TwoOfThreeCustodyPolicy.evaluate(this.getApprovals());
  }

  /**
   * Check whether the transaction is authorized for submission.
   */
  isThresholdSatisfied(): boolean {
    return this.evaluate().satisfied;
  }

  /**
   * Expose intent ID for orchestration/debugging.
   */
  getIntentId(): string {
    return this.intentId;
  }
}
