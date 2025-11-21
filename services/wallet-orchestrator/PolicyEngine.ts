import { MPCRequest } from './OrchestratorTypes';

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
    this.rules = rules;
  }

  evaluate(request: MPCRequest): PolicyResult {
    if (request.amount > this.rules.maxTransactionSize) {
      return { allowed: false, reason: 'Transaction size exceeds limit' };
    }

    if (!this.rules.allowedTokenIds.includes(request.tokenId)) {
      return { allowed: false, reason: 'Token ID not allowed' };
    }

    // Additional rules can be added here
    return { allowed: true };
  }
}