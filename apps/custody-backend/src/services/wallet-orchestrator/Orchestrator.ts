

import { ApprovalRole, ThresholdResult } from "../../shared/threshold/thresholdPolicy.ts";
import { ApprovalTracker } from "./ApprovalTracker.ts";

/**
 * High-level state of a transaction intent.
 */
export enum OrchestratorState {
  PENDING = "PENDING",
  AUTHORIZED = "AUTHORIZED",
  SUBMITTED = "SUBMITTED",
}

/**
 * Represents a single transaction intent
 * managed by the orchestrator.
 */
export type TransactionIntent = {
  intentId: string;
  state: OrchestratorState;
  approvals: ThresholdResult;
};

/**
 * Wallet Orchestrator
 *
 * Responsibilities:
 * - Create transaction intents
 * - Track approvals via ApprovalTracker
 * - Enforce threshold authorization
 * - Expose submission readiness
 *
 * This class does NOT:
 * - Verify signatures
 * - Perform MPC math
 * - Submit Hedera transactions
 */
export class Orchestrator {
  private trackers: Map<string, ApprovalTracker> = new Map();
  private states: Map<string, OrchestratorState> = new Map();

  /**
   * Create a new transaction intent.
   */
  createIntent(intentId: string): TransactionIntent {
    if (this.trackers.has(intentId)) {
      throw new Error("INTENT_ALREADY_EXISTS");
    }

    const tracker = new ApprovalTracker(intentId);
    this.trackers.set(intentId, tracker);
    this.states.set(intentId, OrchestratorState.PENDING);

    return {
      intentId,
      state: OrchestratorState.PENDING,
      approvals: tracker.evaluate(),
    };
  }

  /**
   * Record an approval for an intent.
   */
  addApproval(
    intentId: string,
    role: ApprovalRole
  ): TransactionIntent {
    const tracker = this.trackers.get(intentId);
    const state = this.states.get(intentId);

    if (!tracker || !state) {
      throw new Error("INTENT_NOT_FOUND");
    }

    if (state === OrchestratorState.SUBMITTED) {
      throw new Error("INTENT_ALREADY_SUBMITTED");
    }

    const result = tracker.addApproval(role);

    if (result.satisfied) {
      this.states.set(intentId, OrchestratorState.AUTHORIZED);
    }

    return {
      intentId,
      state: this.states.get(intentId)!,
      approvals: result,
    };
  }

  /**
   * Check whether an intent is authorized for submission.
   */
  isAuthorized(intentId: string): boolean {
    return (
      this.states.get(intentId) === OrchestratorState.AUTHORIZED
    );
  }

  /**
   * Mark an intent as submitted.
   * Should be called ONLY after successful submission.
   */
  markSubmitted(intentId: string): void {
    const state = this.states.get(intentId);

    if (state !== OrchestratorState.AUTHORIZED) {
      throw new Error("INTENT_NOT_AUTHORIZED");
    }

    this.states.set(intentId, OrchestratorState.SUBMITTED);
  }

  /**
   * Get current state of an intent.
   */
  getIntent(intentId: string): TransactionIntent {
    const tracker = this.trackers.get(intentId);
    const state = this.states.get(intentId);

    if (!tracker || !state) {
      throw new Error("INTENT_NOT_FOUND");
    }

    return {
      intentId,
      state,
      approvals: tracker.evaluate(),
    };
  }
}