export type RequestState = 'INIT' | 'ROUND1' | 'ROUND2' | 'COMBINE';

export class RequestStateMachine {
  private readonly stateMap: Map<string, RequestState>;

  constructor() {
    this.stateMap = new Map();
  }

  transition(requestId: string, fromState: RequestState, toState: RequestState): void {
    const currentState = this.stateMap.get(requestId);
    if (currentState && currentState !== fromState) {
      throw new Error(`Invalid state transition: ${currentState} → ${toState}`);
    }
    this.stateMap.set(requestId, toState);
  }

  getState(requestId: string): RequestState | undefined {
    return this.stateMap.get(requestId);
  }
}