import { MPCRequest } from '/Users/namojperiakumar/Desktop/MPC-Wallet/services/wallet-orchestrator/OrchestratorTypes.ts';

export interface PolicyResult {
  allowed: boolean;
  reason?: string;
}

export interface PolicyRules {
  maxTransactionSize: number;
  allowedTokenIds: string[];
  dailyWithdrawalLimit: number;
  adminOverride: boolean;
}

export class PolicyEngine {
  private readonly rules: PolicyRules;

  constructor(rules: PolicyRules) {
    this.rules = {
      maxTransactionSize: rules.maxTransactionSize || 1000,
      allowedTokenIds: rules.allowedTokenIds || [],
      dailyWithdrawalLimit: rules.dailyWithdrawalLimit || 10000,
      adminOverride: rules.adminOverride || false,
    };
  }

  evaluate(request: MPCRequest): PolicyResult {
    // Validate request data
    if (!request || typeof request.amount !== 'number' || !request.tokenId) {
      return { allowed: false, reason: 'Invalid request data' };
    }

    // Check admin override
    if (this.rules.adminOverride && request.isAdmin) {
      return { allowed: true };
    }

    // Check transaction size limit
    if (request.amount > this.rules.maxTransactionSize) {
      return { allowed: false, reason: 'Transaction size exceeds limit' };
    }

    // Check allowed token IDs
    if (!this.rules.allowedTokenIds.includes(request.tokenId)) {
      return { allowed: false, reason: 'Token ID not allowed' };
    }

    // Check daily withdrawal limit (placeholder logic)
    if (request.amount > this.rules.dailyWithdrawalLimit) {
      return { allowed: false, reason: 'Daily withdrawal limit exceeded' };
    }

    // All checks passed
    return { allowed: true };
  }
}