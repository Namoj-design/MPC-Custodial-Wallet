export enum MPCSessionState {
    IDLE = "IDLE",
    READY = "READY",
    RUNNING = "RUNNING",
    COMPLETED = "COMPLETED",
  }
  
  export type MPCState = {
    state: MPCSessionState;
    round: number;
  };
  
  export function initialState(): MPCState {
    return {
      state: MPCSessionState.IDLE,
      round: 0,
    };
  }