// MPC Session States
export enum MPCSessionState {
    IDLE = 'IDLE',
    WAITING_FOR_APPROVALS = 'WAITING_FOR_APPROVALS',
    READY_FOR_SIGNING = 'READY_FOR_SIGNING',
    ROUND_1_COMMIT = 'ROUND_1_COMMIT',
    ROUND_2_REVEAL = 'ROUND_2_REVEAL',
    ROUND_3_PARTIAL_SIG = 'ROUND_3_PARTIAL_SIG',
    SIGNATURE_READY = 'SIGNATURE_READY',
    SUBMITTED = 'SUBMITTED',
    FAILED = 'FAILED'
}

// Participant Roles
export enum ParticipantRole {
    CLIENT = 'CLIENT',
    WEALTH_MANAGER = 'WEALTH_MANAGER',
    BACKEND_CUSTODY = 'BACKEND_CUSTODY'
}

// WebSocket Message Types
export enum WSMessageType {
    // Client → Server
    JOIN = 'join',
    READY = 'ready',
    NONCE_COMMIT = 'nonce_commit',
    NONCE_REVEAL = 'nonce_reveal',
    PARTIAL_SIG = 'partial_sig',
    APPROVE_INTENT = 'approve_intent',

    // Server → Client
    JOINED = 'joined',
    SESSION_READY = 'session_ready',
    ROUND = 'round',
    REQUEST_NONCE_COMMIT = 'request_nonce_commit',
    REQUEST_NONCE_REVEAL = 'request_nonce_reveal',
    REQUEST_PARTIAL_SIG = 'request_partial_sig',
    SIGNATURE_READY = 'signature_ready',
    TRANSACTION_SUBMITTED = 'transaction_submitted',
    ERROR = 'error'
}

// WebSocket Message Interfaces
export interface WSMessage {
    type: WSMessageType;
    payload?: unknown;
}

export interface JoinMessage {
    type: WSMessageType.JOIN;
    payload: {
        sessionId: string;
        role: ParticipantRole;
        publicKeyShare: string; // hex-encoded
    };
}

export interface NonceCommitMessage {
    type: WSMessageType.NONCE_COMMIT;
    payload: {
        sessionId: string;
        commitment: string; // hex-encoded hash
    };
}

export interface NonceRevealMessage {
    type: WSMessageType.NONCE_REVEAL;
    payload: {
        sessionId: string;
        nonce: string; // hex-encoded
    };
}

export interface PartialSigMessage {
    type: WSMessageType.PARTIAL_SIG;
    payload: {
        sessionId: string;
        partialSignature: string; // hex-encoded
    };
}

export interface ApproveIntentMessage {
    type: WSMessageType.APPROVE_INTENT;
    payload: {
        intentId: string;
        role: ParticipantRole;
    };
}

// MPC Session Data
export interface MPCSession {
    sessionId: string;
    intentId: string;
    state: MPCSessionState;
    participants: Map<string, SessionParticipant>;
    message: Uint8Array; // Transaction bytes to sign
    publicKey: Uint8Array; // Combined public key
    nonces: Map<string, NonceData>;
    partialSignatures: Map<string, Uint8Array>;
    finalSignature?: Uint8Array;
    createdAt: Date;
    updatedAt: Date;
}

export interface SessionParticipant {
    clientId: string;
    role: ParticipantRole;
    publicKeyShare: Uint8Array;
    connected: boolean;
    ready: boolean;
}

export interface NonceData {
    commitment: Uint8Array; // H(nonce)
    nonce?: Uint8Array; // Revealed nonce
    publicNonce?: Uint8Array; // R = nonce * G
}

// Cryptographic Types
export interface MPCShare {
    privateShare: Uint8Array; // xi (32 bytes)
    publicShare: Uint8Array; // Xi = xi * G (32 bytes)
}

export interface Ed25519Signature {
    R: Uint8Array; // 32 bytes
    s: Uint8Array; // 32 bytes
}

// Intent Types
export interface Intent {
    id: string;
    recipientAccountId: string;
    amountHBAR: string;
    memo: string;
    createdAt: Date;
    status: IntentStatus;
    sessionId?: string;
    approvals: ApprovalRecord[];
}

export enum IntentStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    EXECUTING = 'EXECUTING',
    EXECUTED = 'EXECUTED',
    FAILED = 'FAILED',
    REJECTED = 'REJECTED'
}

export interface ApprovalRecord {
    approver: ParticipantRole;
    timestamp: Date;
}

// Transaction Types
export interface TransactionRecord {
    id: string;
    intentId: string;
    hederaTxId?: string;
    status: 'PENDING' | 'SUBMITTED' | 'SUCCESS' | 'FAILED';
    signature?: Uint8Array;
    receipt?: unknown;
    submittedAt?: Date;
    confirmedAt?: Date;
    error?: string;
}

// Audit Types
export interface AuditLog {
    id: string;
    timestamp: Date;
    intentId?: string;
    sessionId?: string;
    actorId?: string;
    action: string;
    metadata?: Record<string, unknown>;
}
