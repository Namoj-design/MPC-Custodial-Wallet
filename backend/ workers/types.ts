// backend/workers/types.ts

export type JobType = "MPC_SIGN" | "TOPIC_PUBLISH";

export interface BaseJob<TPayload = any> {
  id: string;
  type: JobType;
  payload: TPayload;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  scheduledAt: Date;
}

export interface MPCSignJobPayload {
  requestId: string;
  publicKey: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface TopicPublishJobPayload {
  topicId: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface MPCSignResult {
  success: boolean;
  signature?: string;
  error?: string;
}

// Adapter interface so workers don’t depend directly on your orchestrator implementation
export interface MPCOrchestrator {
  signWithMPC(
    payload: MPCSignJobPayload
  ): Promise<MPCSignResult>;
}