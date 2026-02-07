import WebSocket from 'ws';
import { MPCEngine } from '../mpc/realEngine.js';
import {
    WSMessageType,
    ParticipantRole
} from '../mpc/types.js';
import { hexToBytes, bytesToHex } from '../shared/utils/encoding.js';
import fs from 'fs';

// Load test shares
const shares = JSON.parse(fs.readFileSync('test-shares.json', 'utf8'));

const API_URL = 'http://localhost:3001';
const WS_URL = 'ws://localhost:3001';

class TestClient {
    private ws: WebSocket;
    private clientId: string = '';
    private sessionId: string = '';
    private privateShare: Uint8Array;
    private publicShare: Uint8Array;
    private nonce: Uint8Array | null = null;
    private nonceCommitment: Uint8Array | null = null;

    constructor(
        private role: ParticipantRole,
        shareHex: string,
        publicShareHex: string
    ) {
        this.ws = new WebSocket(WS_URL);
        this.privateShare = hexToBytes(shareHex);
        this.publicShare = hexToBytes(publicShareHex);

        this.ws.on('open', () => {
            console.log(`[${this.role}] Connected to WS`);
        });

        this.ws.on('message', (data: Buffer) => {
            this.handleMessage(JSON.parse(data.toString()));
        });

        this.ws.on('error', (err) => console.error(`[${this.role}] WS Error:`, err));
    }

    private handleMessage(msg: any) {
        // console.log(`[${this.role}] Received:`, msg.type);

        switch (msg.type) {
            case WSMessageType.JOINED:
                if (msg.payload.clientId) { // My join confirmation or others
                    if (!this.clientId && !this.sessionId) {
                        // This might be the welcome message or session join
                    }
                }
                break;
            case WSMessageType.REQUEST_NONCE_COMMIT:
                this.handleNonceCommit();
                break;
            case WSMessageType.REQUEST_NONCE_REVEAL:
                this.handleNonceReveal();
                break;
            case WSMessageType.REQUEST_PARTIAL_SIG:
                this.handlePartialSig(msg.payload);
                break;
            case WSMessageType.SIGNATURE_READY:
                console.log(`[${this.role}] ✅ Signature Ready! Verified: ${msg.payload.verified}`);
                break;
            case WSMessageType.ERROR:
                console.error(`[${this.role}] ❌ Error from server:`, msg.payload.error);
                break;
        }
    }

    joinSession(sessionId: string) {
        this.sessionId = sessionId;
        this.send({
            type: WSMessageType.JOIN,
            payload: {
                sessionId,
                role: this.role,
                publicKeyShare: bytesToHex(this.publicShare)
            }
        });

        // Auto ready
        setTimeout(() => {
            this.send({
                type: WSMessageType.READY,
                payload: { sessionId }
            });
        }, 500);
    }

    private handleNonceCommit() {
        this.nonce = MPCEngine.generateNonce();
        this.nonceCommitment = MPCEngine.commitNonce(this.nonce);

        console.log(`[${this.role}] Sending nonce commitment`);
        this.send({
            type: WSMessageType.NONCE_COMMIT,
            payload: {
                sessionId: this.sessionId,
                commitment: bytesToHex(this.nonceCommitment)
            }
        });
    }

    private handleNonceReveal() {
        if (!this.nonce) return;

        console.log(`[${this.role}] Sending nonce reveal`);
        this.send({
            type: WSMessageType.NONCE_REVEAL,
            payload: {
                sessionId: this.sessionId,
                nonce: bytesToHex(this.nonce)
            }
        });
    }

    private handlePartialSig(payload: any) {
        if (!this.nonce || !this.privateShare) return;

        const { R, message, publicKey } = payload;

        // Challenge c = H(R, A, m)
        const challenge = MPCEngine.computeChallenge(
            hexToBytes(R),
            hexToBytes(publicKey),
            hexToBytes(message)
        );

        const partialSig = MPCEngine.computePartialSignature(
            this.nonce,
            this.privateShare,
            challenge
        );

        console.log(`[${this.role}] Sending partial signature`);
        this.send({
            type: WSMessageType.PARTIAL_SIG,
            payload: {
                sessionId: this.sessionId,
                partialSignature: bytesToHex(partialSig)
            }
        });
    }

    private send(msg: any) {
        this.ws.send(JSON.stringify(msg));
    }

    close() {
        this.ws.close();
    }
}

async function apiRequest(method: string, path: string, body?: any) {
    const response = await fetch(`${API_URL}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
    });
    return response.json();
}

async function main() {
    console.log('🚀 Starting E2E Test...');

    // 1. Create 2 clients
    const client1 = new TestClient(ParticipantRole.CLIENT, shares.p1.privateShare, shares.p1.publicShare);
    const client2 = new TestClient(ParticipantRole.WEALTH_MANAGER, shares.p2.privateShare, shares.p2.publicShare);

    // Wait for WS connection
    await new Promise(r => setTimeout(r, 1000));

    // 2. Create Intent via API
    console.log('Creating intent...');
    const intent = await apiRequest('POST', '/api/intents', {
        recipientAccountId: '0.0.12345',
        amountHBAR: '1',
        memo: 'Test MPC Transfer',
        creatorId: 'client_1'
    }) as any;
    console.log('Intent created:', intent.id);

    // 3. Approve Intent (Client)
    console.log('Approving as Client...');
    await apiRequest('POST', `/api/intents/${intent.id}/approve`, {
        role: ParticipantRole.CLIENT
    });

    // 4. Approve Intent (Wealth Manager) -> Should trigger MPC
    console.log('Approving as Wealth Manager...');
    await apiRequest('POST', `/api/intents/${intent.id}/approve`, {
        role: ParticipantRole.WEALTH_MANAGER
    });

    // 5. Poll for MPC Session ID
    console.log('Waiting for MPC Session...');
    let sessionId: string | undefined;

    for (let i = 0; i < 10; i++) {
        const updatedIntent = await apiRequest('GET', `/api/intents/${intent.id}`) as any;
        if (updatedIntent.sessionId) {
            sessionId = updatedIntent.sessionId;
            console.log('Found session ID:', sessionId);
            break;
        }
        await new Promise(r => setTimeout(r, 1000));
    }

    if (!sessionId) {
        throw new Error('Timeout waiting for session ID');
    }

    // 6. Connect clients to the session
    console.log('Joining session...');
    client1.joinSession(sessionId);
    client2.joinSession(sessionId);

    // Keep alive to allow ceremony to complete
    await new Promise(r => setTimeout(r, 10000));

    console.log('✅ E2E Test Completed (Check logs for success)');
    process.exit(0);
}

main().catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
});
