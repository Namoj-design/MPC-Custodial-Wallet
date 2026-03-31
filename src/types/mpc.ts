// MPC Signing Session Types

export type MPCParticipantRole = 'client' | 'wealthManager' | 'custody';

export type ParticipantStatus = 'waiting' | 'connected' | 'signed';

export interface MPCParticipant {
  role: MPCParticipantRole;
  label: string;
  status: ParticipantStatus;
}

export type MPCStepStatus = 'completed' | 'active' | 'pending';

export interface MPCStep {
  id: string;
  label: string;
  status: MPCStepStatus;
}

export type MPCEventType =
  | 'SESSION_CREATED'
  | 'PARTICIPANT_JOINED'
  | 'NONCE_COMMIT'
  | 'NONCE_REVEAL'
  | 'PARTIAL_SIGNATURE_SUBMITTED'
  | 'SIGNATURE_COMPLETE'
  | 'TRANSACTION_SUBMITTED';

export interface MPCSession {
  sessionId: string;
  transactionId: string;
  startedAt: string;
  participants: MPCParticipant[];
  steps: MPCStep[];
  currentRound: string;
}
