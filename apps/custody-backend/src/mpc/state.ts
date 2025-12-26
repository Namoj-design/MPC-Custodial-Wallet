export enum MPCSessionState {
    CREATED = "CREATED",
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
      state: MPCSessionState.CREATED,
      round: 0,
    };
  }