import { ApprovalRole, ThresholdResult } from "../../shared/threshold/thresholdPolicy.ts";
import { ApprovalTracker } from "./ApprovalTracker.ts";
import { RequestStateMachine, RequestState } from "./RequestStateMachine.ts";

/**
 * Transaction intent managed by the orchestrator
 */
export type TransactionIntent = {
  intentId: string;
  state: RequestState;
  approvals: ThresholdResult;
};

/**
 * Wallet Orchestrator (Phase 3B)
 *
 * Owns:
 * - Request lifecycle
 * - Approval tracking
 * - Threshold enforcement
 */
export class Orchestrator {
  private trackers = new Map<string, ApprovalTracker>();
  private machines = new Map<string, RequestStateMachine>();

  /**
   * Create a new transaction intent
   */
  createIntent(intentId: string): TransactionIntent {
    if (this.trackers.has(intentId)) {
      throw new Error("INTENT_ALREADY_EXISTS");
    }

    const tracker = new ApprovalTracker(intentId);
    const machine = new RequestStateMachine(RequestState.CREATED);

    this.trackers.set(intentId, tracker);
    this.machines.set(intentId, machine);

    return this.snapshot(intentId);
  }

  /**
   * Mark intent as policy-approved
   */
  approvePolicy(intentId: string): void {
    const machine = this.getMachine(intentId);
    machine.transition(RequestState.POLICY_APPROVED);
    machine.transition(RequestState.AWAITING_APPROVALS);
  }

  /**
   * Record an approval (CLIENT / CUSTODIAN / RECOVERY)
   */
  addApproval(intentId: string, role: ApprovalRole): TransactionIntent {
    const tracker = this.getTracker(intentId);
    const machine = this.getMachine(intentId);

    if (machine.isTerminal()) {
      throw new Error("INTENT_TERMINAL");
    }

    const result = tracker.addApproval(role);

    if (result.satisfied && machine.getState() === RequestState.AWAITING_APPROVALS) {
      machine.transition(RequestState.AUTHORIZED);
    }

    return this.snapshot(intentId);
  }

  /**
   * Approve intent from CLIENT (HashPack)
   */
  approveClient(intentId: string): TransactionIntent {
    return this.addApproval(intentId, "CLIENT");
  }

  /**
   * Mark intent as submitted
   */
  markSubmitted(intentId: string): void {
    const machine = this.getMachine(intentId);
    machine.transition(RequestState.SUBMITTED);
  }

  /**
   * Mark intent as confirmed
   */
  markConfirmed(intentId: string): void {
    const machine = this.getMachine(intentId);
    machine.transition(RequestState.CONFIRMED);
  }

  /**
   * Reject intent
   */
  reject(intentId: string): void {
    const machine = this.getMachine(intentId);
    machine.transition(RequestState.REJECTED);
  }

  /**
   * Snapshot current intent state
   */
  getIntent(intentId: string): TransactionIntent {
    return this.snapshot(intentId);
  }

  // -------- Internal helpers --------

  private getTracker(intentId: string): ApprovalTracker {
    const tracker = this.trackers.get(intentId);
    if (!tracker) throw new Error("INTENT_NOT_FOUND");
    return tracker;
  }

  private getMachine(intentId: string): RequestStateMachine {
    const machine = this.machines.get(intentId);
    if (!machine) throw new Error("INTENT_NOT_FOUND");
    return machine;
  }

  private snapshot(intentId: string): TransactionIntent {
    const tracker = this.getTracker(intentId);
    const machine = this.getMachine(intentId);

    return {
      intentId,
      state: machine.getState(),
      approvals: tracker.evaluate(),
    };
  }
}