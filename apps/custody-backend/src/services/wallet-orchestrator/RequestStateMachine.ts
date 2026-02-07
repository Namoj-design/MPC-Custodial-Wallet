import { IntentStatus } from '../../mpc/types.js';

/**
 * Deterministic state machine for intent lifecycle
 */
export class RequestStateMachine {
    /**
     * Get valid next states for current state
     */
    private static getValidTransitions(currentState: IntentStatus): IntentStatus[] {
        const transitions: Record<IntentStatus, IntentStatus[]> = {
            [IntentStatus.PENDING]: [IntentStatus.APPROVED, IntentStatus.REJECTED],
            [IntentStatus.APPROVED]: [IntentStatus.EXECUTING, IntentStatus.FAILED],
            [IntentStatus.EXECUTING]: [IntentStatus.EXECUTED, IntentStatus.FAILED],
            [IntentStatus.EXECUTED]: [], // Terminal state
            [IntentStatus.FAILED]: [], // Terminal state
            [IntentStatus.REJECTED]: [] // Terminal state
        };

        return transitions[currentState] || [];
    }

    /**
     * Check if state transition is valid
     */
    static canTransition(from: IntentStatus, to: IntentStatus): boolean {
        const validNext = this.getValidTransitions(from);
        return validNext.includes(to);
    }

    /**
     * Validate and execute state transition
     */
    static transition(currentState: IntentStatus, newState: IntentStatus): IntentStatus {
        if (!this.canTransition(currentState, newState)) {
            throw new Error(
                `Invalid state transition: ${currentState} → ${newState}`
            );
        }
        return newState;
    }

    /**
     * Get next state after approval threshold reached
     */
    static getStateAfterApproval(currentState: IntentStatus, thresholdReached: boolean): IntentStatus {
        if (currentState !== IntentStatus.PENDING) {
            return currentState;
        }

        if (thresholdReached) {
            return IntentStatus.APPROVED;
        }

        return currentState;
    }

    /**
     * Get state after signing started
     */
    static getStateAfterSigningStarted(currentState: IntentStatus): IntentStatus {
        return this.transition(currentState, IntentStatus.EXECUTING);
    }

    /**
     * Get state after transaction submitted
     */
    static getStateAfterSubmission(currentState: IntentStatus): IntentStatus {
        return this.transition(currentState, IntentStatus.EXECUTED);
    }

    /**
     * Get state after failure
     */
    static getStateAfterFailure(currentState: IntentStatus): IntentStatus {
        if (currentState === IntentStatus.EXECUTED) {
            return currentState; // Can't fail after success
        }
        return IntentStatus.FAILED;
    }

    /**
     * Check if state is terminal
     */
    static isTerminal(state: IntentStatus): boolean {
        return this.getValidTransitions(state).length === 0;
    }
}
