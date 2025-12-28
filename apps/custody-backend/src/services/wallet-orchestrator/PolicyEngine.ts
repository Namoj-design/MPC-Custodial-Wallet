/**
 * PolicyEngine
 *
 * Custodial decision engine that evaluates whether a transaction
 * intent is allowed to proceed to approval.
 *
 * This engine is executed BEFORE threshold approval.
 * It represents the custodian / wealth manager’s rules.
 */

/**
 * Supported transaction types.
 * Extend this as new capabilities are added.
 */
export enum TransactionType {
  TRANSFER = "TRANSFER",
  ACCOUNT_CREATE = "ACCOUNT_CREATE",
}

/**
 * Canonical transaction intent evaluated by the policy engine.
 */
export type TransactionIntentContext = {
  intentId: string;
  type: TransactionType;

  // monetary fields (in tinybars or smallest unit)
  amount?: bigint;

  // destination identifier (accountId, address, etc.)
  destination?: string;

  // optional metadata
  metadata?: Record<string, unknown>;
};

/**
 * Result of a policy evaluation.
 */
export type PolicyResult = {
  allowed: boolean;
  reason?: string;
};

/**
 * Custodial Policy Engine
 *
 * Default implementation:
 * - Enforces transaction amount limits
 * - Allows extension for allowlists, geofencing, AML, etc.
 */
export class PolicyEngine {
  private readonly maxTransferAmount: bigint;

  constructor(config?: { maxTransferAmount?: bigint }) {
    // Default max: 100 HBAR in tinybars (100 * 10^8)
    this.maxTransferAmount =
      config?.maxTransferAmount ??
      100n * 100_000_000n;
  }

  /**
   * Evaluate whether a transaction intent is allowed.
   */
  evaluate(
    ctx: TransactionIntentContext
  ): PolicyResult {
    switch (ctx.type) {
      case TransactionType.TRANSFER:
        return this.evaluateTransfer(ctx);

      case TransactionType.ACCOUNT_CREATE:
        return { allowed: true };

      default:
        return {
          allowed: false,
          reason: "UNSUPPORTED_TRANSACTION_TYPE",
        };
    }
  }

  /**
   * Enforce transfer-specific policies.
   */
  private evaluateTransfer(
    ctx: TransactionIntentContext
  ): PolicyResult {
    if (ctx.amount === undefined) {
      return {
        allowed: false,
        reason: "MISSING_TRANSFER_AMOUNT",
      };
    }

    if (ctx.amount <= 0n) {
      return {
        allowed: false,
        reason: "INVALID_TRANSFER_AMOUNT",
      };
    }

    if (ctx.amount > this.maxTransferAmount) {
      return {
        allowed: false,
        reason: "TRANSFER_LIMIT_EXCEEDED",
      };
    }

    if (!ctx.destination) {
      return {
        allowed: false,
        reason: "MISSING_DESTINATION",
      };
    }

    return { allowed: true };
  }
}
