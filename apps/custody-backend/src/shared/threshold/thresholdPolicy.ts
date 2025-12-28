

/**
 * Threshold policy definitions for MPC custodial wallets.
 *
 * This module is PURE business logic:
 * - No crypto
 * - No network calls
 * - No persistence
 *
 * It answers one question:
 *   "Given a set of approvals, is the threshold satisfied?"
 */

/**
 * Logical roles participating in custody.
 * These map 1:1 with real-world authorities.
 */
export enum ApprovalRole {
  CLIENT = "CLIENT",
  CUSTODIAN = "CUSTODIAN",
  RECOVERY = "RECOVERY",
}

/**
 * Approval record for a single authority.
 * (Signature verification happens elsewhere.)
 */
export type Approval = {
  role: ApprovalRole;
  approvedAt: string; // ISO timestamp
};

/**
 * Result of a threshold evaluation.
 */
export type ThresholdResult = {
  satisfied: boolean;
  missingRoles: ApprovalRole[];
  approvedRoles: ApprovalRole[];
};

/**
 * Generic threshold policy.
 * Designed to scale beyond 2-of-3 in the future.
 */
export class ThresholdPolicy {
  private readonly requiredApprovals: number;
  private readonly allowedRoles: Set<ApprovalRole>;

  constructor(
    requiredApprovals: number,
    allowedRoles: ApprovalRole[]
  ) {
    if (requiredApprovals <= 0) {
      throw new Error("requiredApprovals must be > 0");
    }

    if (requiredApprovals > allowedRoles.length) {
      throw new Error(
        "requiredApprovals cannot exceed number of allowed roles"
      );
    }

    this.requiredApprovals = requiredApprovals;
    this.allowedRoles = new Set(allowedRoles);
  }

  /**
   * Evaluate whether the threshold is satisfied.
   */
  evaluate(approvals: Approval[]): ThresholdResult {
    const approvedRoles = new Set<ApprovalRole>();

    for (const approval of approvals) {
      if (this.allowedRoles.has(approval.role)) {
        approvedRoles.add(approval.role);
      }
    }

    const approvedList = Array.from(approvedRoles);
    const satisfied =
      approvedRoles.size >= this.requiredApprovals;

    const missingRoles = Array.from(this.allowedRoles).filter(
      (role) => !approvedRoles.has(role)
    );

    return {
      satisfied,
      approvedRoles: approvedList,
      missingRoles,
    };
  }
}

/**
 * Canonical 2-of-3 custody policy:
 * CLIENT + CUSTODIAN + RECOVERY
 */
export const TwoOfThreeCustodyPolicy =
  new ThresholdPolicy(2, [
    ApprovalRole.CLIENT,
    ApprovalRole.CUSTODIAN,
    ApprovalRole.RECOVERY,
  ]);