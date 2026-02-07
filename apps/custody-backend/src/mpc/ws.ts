import { WebSocketServer, WebSocket } from 'ws';
import { randomBytes } from 'crypto';
import {
    MPCSession,
    MPCSessionState,
    ParticipantRole,
    WSMessageType,
    SessionParticipant
} from './types.js';
import { MPCEngine } from './realEngine.js';
import { SignatureAudit } from '../shared/audit/signatureAudit.js';
import { AuditRepository } from '../storage/AuditRepository.js';
import { IntentRepository } from '../storage/IntentRepository.js';
import { hexToBytes, bytesToHex } from '../shared/utils/encoding.js';

interface WSClient {
    ws: WebSocket;
    clientId: string;
    role?: ParticipantRole;
    sessionId?: string;
}

/**
 * MPC WebSocket Server for coordinating threshold signing ceremonies
 */
export class MPCWebSocketServer {
    private wss: WebSocketServer;
    private clients: Map<string, WSClient> = new Map();
    private sessions: Map<string, MPCSession> = new Map();
    private signatureAudit: SignatureAudit;
    private backendShare?: Uint8Array;
    private onSignatureReady?: (sessionId: string, intentId: string, signature: Uint8Array) => void;

    constructor(
        port: number,
        _intentRepo: IntentRepository, // Reserved for future use
        auditRepo: AuditRepository
    ) {
        this.wss = new WebSocketServer({ port });
        this.signatureAudit = new SignatureAudit(auditRepo);

        // Load backend's MPC share from environment
        const backendShareHex = process.env.MPC_BACKEND_SHARE;
        if (backendShareHex) {
            this.backendShare = hexToBytes(backendShareHex);
            // Public share computation removed as it was unused
            console.log(`[WS] Backend MPC share loaded (${this.backendShare.length} bytes)`);
        }

        this.setupWebSocketServer();
    }

    setSignatureReadyCallback(callback: (sessionId: string, intentId: string, signature: Uint8Array) => void): void {
        this.onSignatureReady = callback;
    }

    private setupWebSocketServer(): void {
        this.wss.on('connection', (ws: WebSocket) => {
            const clientId = this.generateClientId();

            const client: WSClient = {
                ws,
                clientId
            };

            this.clients.set(clientId, client);
            console.log(`[WS] Client connected: ${clientId}`);

            ws.on('message', (data: Buffer) => {
                this.handleMessage(clientId, data);
            });

            ws.on('close', () => {
                this.handleDisconnect(clientId);
            });

            ws.on('error', (error) => {
                console.error(`[WS] Client ${clientId} error:`, error);
            });

            // Send welcome message
            this.sendToClient(clientId, {
                type: WSMessageType.JOINED,
                payload: { clientId }
            });
        });

        console.log(`[WS] MPC WebSocket server listening on port ${this.wss.options.port}`);
    }

    private handleMessage(clientId: string, data: Buffer): void {
        try {
            const message = JSON.parse(data.toString());
            const { type, payload } = message;

            console.log(`[WS] Received from ${clientId}: ${type}`);

            switch (type) {
                case WSMessageType.JOIN:
                    this.handleJoin(clientId, payload);
                    break;
                case WSMessageType.READY:
                    this.handleReady(clientId, payload);
                    break;
                case WSMessageType.NONCE_COMMIT:
                    this.handleNonceCommit(clientId, payload);
                    break;
                case WSMessageType.NONCE_REVEAL:
                    this.handleNonceReveal(clientId, payload);
                    break;
                case WSMessageType.PARTIAL_SIG:
                    this.handlePartialSignature(clientId, payload);
                    break;
                case WSMessageType.APPROVE_INTENT:
                    this.handleApproveIntent(clientId, payload);
                    break;
                default:
                    console.warn(`[WS] Unknown message type: ${type}`);
            }
        } catch (error) {
            console.error(`[WS] Error handling message from ${clientId}:`, error);
            this.sendError(clientId, `Failed to process message: ${(error as Error).message}`);
        }
    }

    private handleJoin(clientId: string, payload: any): void {
        const { sessionId, role, publicKeyShare } = payload;

        const client = this.clients.get(clientId);
        if (!client) return;

        client.role = role as ParticipantRole;
        client.sessionId = sessionId;

        // Get or create session
        let session = this.sessions.get(sessionId);
        if (!session) {
            // Create new session (needs intent to be set later)
            session = this.createSession(sessionId);
        }

        // Add participant
        const participant: SessionParticipant = {
            clientId,
            role: role as ParticipantRole,
            publicKeyShare: hexToBytes(publicKeyShare),
            connected: true,
            ready: false
        };

        session.participants.set(clientId, participant);
        console.log(`[WS] Client ${clientId} joined session ${sessionId} as ${role}`);

        // Broadcast participant joined
        this.broadcastToSession(sessionId, {
            type: WSMessageType.JOINED,
            payload: { clientId, role, participantCount: session.participants.size }
        });
    }

    private handleReady(clientId: string, _payload: any): void {
        const client = this.clients.get(clientId);
        if (!client || !client.sessionId) return;

        const session = this.sessions.get(client.sessionId);
        if (!session) return;

        const participant = session.participants.get(clientId);
        if (!participant) return;

        participant.ready = true;
        console.log(`[WS] Client ${clientId} is ready`);

        // Check if all participants are ready
        const allReady = Array.from(session.participants.values()).every(p => p.ready);

        if (allReady && session.participants.size >= 2) {
            this.startSigningCeremony(client.sessionId);
        }
    }

    private handleNonceCommit(clientId: string, payload: any): void {
        const { sessionId, commitment } = payload;

        const session = this.sessions.get(sessionId);
        if (!session) {
            this.sendError(clientId, 'Session not found');
            return;
        }

        if (session.state !== MPCSessionState.ROUND_1_COMMIT) {
            this.sendError(clientId, `Invalid state for nonce commit: ${session.state}`);
            return;
        }

        // Store commitment
        const commitmentBytes = hexToBytes(commitment);
        session.nonces.set(clientId, { commitment: commitmentBytes });

        this.signatureAudit.logNonceCommitReceived(sessionId, clientId, commitment);

        console.log(`[WS] Nonce commitment from ${clientId}`);

        // Check if all commitments received
        if (session.nonces.size === session.participants.size) {
            this.advanceToReveal(sessionId);
        }
    }

    private handleNonceReveal(clientId: string, payload: any): void {
        const { sessionId, nonce } = payload;

        const session = this.sessions.get(sessionId);
        if (!session) {
            this.sendError(clientId, 'Session not found');
            return;
        }

        if (session.state !== MPCSessionState.ROUND_2_REVEAL) {
            this.sendError(clientId, `Invalid state for nonce reveal: ${session.state}`);
            return;
        }

        const nonceData = session.nonces.get(clientId);
        if (!nonceData) {
            this.sendError(clientId, 'No commitment found');
            return;
        }

        // Verify commitment
        const nonceBytes = hexToBytes(nonce);
        if (!MPCEngine.verifyNonceCommitment(nonceBytes, nonceData.commitment)) {
            this.sendError(clientId, 'Nonce commitment verification failed');
            return;
        }

        // Store nonce and compute public nonce
        nonceData.nonce = nonceBytes;
        nonceData.publicNonce = MPCEngine.computePublicNonce(nonceBytes);

        this.signatureAudit.logNonceRevealReceived(sessionId, clientId, nonce);

        console.log(`[WS] Nonce reveal from ${clientId} verified`);

        // Check if all reveals received
        const allRevealed = Array.from(session.nonces.values()).every(n => n.nonce);
        if (allRevealed) {
            this.advanceToPartialSig(sessionId);
        }
    }

    private handlePartialSignature(clientId: string, payload: any): void {
        const { sessionId, partialSignature } = payload;

        const session = this.sessions.get(sessionId);
        if (!session) {
            this.sendError(clientId, 'Session not found');
            return;
        }

        if (session.state !== MPCSessionState.ROUND_3_PARTIAL_SIG) {
            this.sendError(clientId, `Invalid state for partial signature: ${session.state}`);
            return;
        }

        const partialSigBytes = hexToBytes(partialSignature);
        session.partialSignatures.set(clientId, partialSigBytes);

        this.signatureAudit.logPartialSignatureReceived(sessionId, clientId, partialSignature);

        console.log(`[WS] Partial signature from ${clientId}`);

        // Check if enough partial signatures (need 2 for 2-of-3)
        if (session.partialSignatures.size >= 2) {
            this.aggregateSignature(sessionId);
        }
    }

    private handleApproveIntent(clientId: string, payload: any): void {
        const { intentId, role } = payload;

        console.log(`[WS] Approval from ${clientId} for intent ${intentId} as ${role}`);

        // In production, this would trigger the orchestrator
        // For now, just log it
    }

    private handleDisconnect(clientId: string): void {
        const client = this.clients.get(clientId);
        if (client && client.sessionId) {
            const session = this.sessions.get(client.sessionId);
            if (session) {
                const participant = session.participants.get(clientId);
                if (participant) {
                    participant.connected = false;
                }
            }
        }

        this.clients.delete(clientId);
        console.log(`[WS] Client disconnected: ${clientId}`);
    }

    private createSession(sessionId: string): MPCSession {
        const session: MPCSession = {
            sessionId,
            intentId: '',
            state: MPCSessionState.IDLE,
            participants: new Map(),
            message: new Uint8Array(),
            publicKey: new Uint8Array(),
            nonces: new Map(),
            partialSignatures: new Map(),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.sessions.set(sessionId, session);
        return session;
    }

    private startSigningCeremony(sessionId: string): void {
        const session = this.sessions.get(sessionId);
        if (!session) return;

        console.log(`[WS] Starting signing ceremony for session ${sessionId}`);

        session.state = MPCSessionState.ROUND_1_COMMIT;
        this.signatureAudit.logSigningRoundStarted(sessionId, session.intentId, 'ROUND_1_COMMIT');

        this.broadcastToSession(sessionId, {
            type: WSMessageType.REQUEST_NONCE_COMMIT,
            payload: { round: 1 }
        });
    }

    private advanceToReveal(sessionId: string): void {
        const session = this.sessions.get(sessionId);
        if (!session) return;

        session.state = MPCSessionState.ROUND_2_REVEAL;
        this.signatureAudit.logSigningRoundStarted(sessionId, session.intentId, 'ROUND_2_REVEAL');

        this.broadcastToSession(sessionId, {
            type: WSMessageType.REQUEST_NONCE_REVEAL,
            payload: { round: 2 }
        });
    }

    private advanceToPartialSig(sessionId: string): void {
        const session = this.sessions.get(sessionId);
        if (!session) return;

        // Aggregate public nonces
        const publicNonces = Array.from(session.nonces.values())
            .map(n => n.publicNonce!)
            .filter(n => n);

        const R = MPCEngine.aggregatePublicNonces(publicNonces);

        session.state = MPCSessionState.ROUND_3_PARTIAL_SIG;
        this.signatureAudit.logSigningRoundStarted(sessionId, session.intentId, 'ROUND_3_PARTIAL_SIG');

        // Broadcast R and request partial signatures
        this.broadcastToSession(sessionId, {
            type: WSMessageType.REQUEST_PARTIAL_SIG,
            payload: {
                round: 3,
                R: bytesToHex(R),
                publicKey: bytesToHex(session.publicKey),
                message: bytesToHex(session.message)
            }
        });
    }

    private aggregateSignature(sessionId: string): void {
        const session = this.sessions.get(sessionId);
        if (!session) return;

        try {
            // Get partial signatures (need at least 2)
            const partialSigs = Array.from(session.partialSignatures.values());

            // Aggregate
            const s = MPCEngine.aggregatePartialSignatures(partialSigs);

            // Get R
            const publicNonces = Array.from(session.nonces.values())
                .map(n => n.publicNonce!)
                .filter(n => n);
            const R = MPCEngine.aggregatePublicNonces(publicNonces);

            // Create final signature
            const signature = MPCEngine.createSignature(R, s);

            // Verify signature
            const valid = MPCEngine.verifySignature(signature, session.message, session.publicKey);

            this.signatureAudit.logSignatureAggregated(sessionId, session.intentId, bytesToHex(signature));
            this.signatureAudit.logSignatureVerified(sessionId, session.intentId, bytesToHex(signature), valid);

            if (!valid) {
                throw new Error('Signature verification failed');
            }

            session.finalSignature = signature;
            session.state = MPCSessionState.SIGNATURE_READY;

            console.log(`[WS] Signature ready for session ${sessionId}`);

            // Broadcast signature ready
            this.broadcastToSession(sessionId, {
                type: WSMessageType.SIGNATURE_READY,
                payload: {
                    signature: bytesToHex(signature),
                    verified: valid
                }
            });

            // Notify backend listener
            if (this.onSignatureReady) {
                this.onSignatureReady(sessionId, session.intentId, signature);
            }

        } catch (error) {
            console.error(`[WS] Signature aggregation failed:`, error);
            session.state = MPCSessionState.FAILED;
            this.signatureAudit.logSigningFailed(sessionId, session.intentId, (error as Error).message);

            this.broadcastToSession(sessionId, {
                type: WSMessageType.ERROR,
                payload: { error: (error as Error).message }
            });
        }
    }

    private sendToClient(clientId: string, message: any): void {
        const client = this.clients.get(clientId);
        if (client && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify(message));
        }
    }

    private broadcastToSession(sessionId: string, message: any): void {
        const session = this.sessions.get(sessionId);
        if (!session) return;

        for (const participant of session.participants.values()) {
            if (participant.connected) {
                this.sendToClient(participant.clientId, message);
            }
        }
    }

    private sendError(clientId: string, error: string): void {
        this.sendToClient(clientId, {
            type: WSMessageType.ERROR,
            payload: { error }
        });
    }

    private generateClientId(): string {
        return `client_${randomBytes(8).toString('hex')}`;
    }

    /**
     * Create signing session for an intent
     */
    createSigningSession(intentId: string, message: Uint8Array, publicKey: Uint8Array): string {
        const sessionId = `session_${randomBytes(16).toString('hex')}`;

        const session: MPCSession = {
            sessionId,
            intentId,
            state: MPCSessionState.WAITING_FOR_APPROVALS,
            participants: new Map(),
            message,
            publicKey,
            nonces: new Map(),
            partialSignatures: new Map(),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.sessions.set(sessionId, session);

        console.log(`[WS] Created signing session ${sessionId} for intent ${intentId}`);

        return sessionId;
    }

    /**
     * Get session by ID
     */
    getSession(sessionId: string): MPCSession | undefined {
        return this.sessions.get(sessionId);
    }

    /**
     * Close the server
     */
    close(): void {
        this.wss.close();
    }
}
