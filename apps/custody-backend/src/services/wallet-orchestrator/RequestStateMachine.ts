/**
 * RequestStateMachine
 *
 * Models the lifecycle of a custody transaction request.
 * This is a PURE state machine:
 * - No crypto
 * - No Hedera
 * - No network calls
 *
 * It prevents invalid state transitions and
 * provides a single source of truth for request status.
 */

/**
 * All possible request states.
 */
export enum RequestState {
  CREATED = "CREATED",               // Intent created
  POLICY_APPROVED = "POLICY_APPROVED", // Passed PolicyEngine
  AWAITING_APPROVALS = "AWAITING_APPROVALS", // Waiting for threshold
  AUTHORIZED = "AUTHORIZED",         // Threshold satisfied
  SUBMITTED = "SUBMITTED",           // Sent to Hedera
  CONFIRMED = "CONFIRMED",           // Receipt success
  REJECTED = "REJECTED",             // Policy or approval rejection
  FAILED = "FAILED",                 // Runtime failure
}

/**
 * Allowed state transitions.
 * Any transition not listed here is INVALID.
 */
const AllowedTransitions: Record<RequestState, RequestState[]> = {
  [RequestState.CREATED]: [
    RequestState.POLICY_APPROVED,
    RequestState.REJECTED,
  ],

  [RequestState.POLICY_APPROVED]: [
    RequestState.AWAITING_APPROVALS,
    RequestState.REJECTED,
  ],

  [RequestState.AWAITING_APPROVALS]: [
    RequestState.AUTHORIZED,
    RequestState.REJECTED,
  ],

  [RequestState.AUTHORIZED]: [
    RequestState.SUBMITTED,
  ],

  [RequestState.SUBMITTED]: [
    RequestState.CONFIRMED,
    RequestState.FAILED,
  ],

  [RequestState.CONFIRMED]: [],

  [RequestState.REJECTED]: [],

  [RequestState.FAILED]: [],
};

/**
 * Request State Machine
 */
export class RequestStateMachine {
  private state: RequestState;

  constructor(initialState: RequestState = RequestState.CREATED) {
    this.state = initialState;
  }

  /**
   * Get current state.
   */
  getState(): RequestState {
    return this.state;
  }

  /**
   * Attempt a state transition.
   * Throws if transition is invalid.
   */
  transition(next: RequestState): void {
    const allowed = AllowedTransitions[this.state];

    if (!allowed.includes(next)) {
      throw new Error(
        `INVALID_STATE_TRANSITION: ${this.state} -> ${next}`
      );
    }

    this.state = next;
  }

  /**
   * Convenience guards
   */
  isTerminal(): boolean {
    return (
      this.state === RequestState.CONFIRMED ||
      this.state === RequestState.REJECTED ||
      this.state === RequestState.FAILED
    );
  }

  isAuthorized(): boolean {
    return this.state === RequestState.AUTHORIZED;
  }
}
