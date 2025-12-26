import { MPCSession } from "./session";
import { MPCSessionState } from "./state";

export class MPCOrchestrator {
  constructor(private session: MPCSession) {}

  onReady() {
    if (this.session.state.state !== MPCSessionState.IDLE) {
      throw new Error("Invalid state for READY");
    }
    this.session.state.state = MPCSessionState.READY;
  }

  onRound(round: number, payload: any) {
    if (this.session.state.state !== MPCSessionState.READY &&
        this.session.state.state !== MPCSessionState.RUNNING) {
      throw new Error("Invalid state for ROUND");
    }

    this.session.state.state = MPCSessionState.RUNNING;
    this.session.state.round = round;

    // fake computation placeholder
    return {
      ok: true,
      nextRound: round + 1,
      result: payload,
    };
  }

  onComplete() {
    this.session.state.state = MPCSessionState.COMPLETED;
  }
}