# MPC Custody Backend

Production-grade 2-of-3 MPC custodial wallet backend for Hedera Testnet.

## Features

- **Threshold Ed25519 Signing**: 2-of-3 MPC with additive secret sharing
- **WebSocket Orchestration**: Real-time MPC ceremony coordination
- **Hedera Integration**: Transaction submission to Hedera testnet
- **REST API**: Intent management and transaction status
- **Audit Logging**: Complete compliance and audit trail
- **Security**: Nonce commit-reveal, replay protection, signature verification

## Architecture

### Components

- **MPC Engine** (`src/mpc/realEngine.ts`): Threshold Ed25519 cryptography
- **WebSocket Server** (`src/mpc/ws.ts`): MPC ceremony orchestration
- **Orchestrator** (`src/services/wallet-orchestrator/`): Intent flow management
- **Hedera Integration** (`src/hedera/`): Transaction execution
- **REST API** (`src/api/`): HTTP endpoints
- **Storage** (`src/storage/`): In-memory repositories (DB-ready)

### Flow

1. **Client creates intent** → `POST /api/intents/create`
2. **Approvals collected** → `POST /api/intents/:id/approve` (need 2-of-3)
3. **MPC signing triggered** → WebSocket ceremony coordination
4. **Transaction submitted** → Hedera testnet
5. **Status tracked** → `GET /api/transactions/:id/status`

## Setup

### Prerequisites

- Node.js 20+
- Hedera testnet account
- MPC shares (pre-generated for MVP)

### Installation

```bash
cd apps/custody-backend
npm install
```

### Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required environment variables:
- `HEDERA_OPERATOR_ID` - Your Hedera operator account ID
- `HEDERA_OPERATOR_KEY` - Your Hedera operator private key
- `HEDERA_MPC_ACCOUNT_ID` - MPC wallet account ID
- `MPC_BACKEND_SHARE` - Backend's MPC share (hex)
- `MPC_PUBLIC_KEY` - Combined public key (hex)

### Run

Development:
```bash
npm run dev
```

Production build:
```bash
npm run build
node dist/index.js
```

Type check:
```bash
npm run typecheck
```

## API Reference

### REST Endpoints

#### Create Intent
```bash
POST /api/intents/create
Content-Type: application/json

{
  "recipientAccountId": "0.0.123456",
  "amountHBAR": "10",
  "memo": "Payment for services"
}
```

#### Get Intent
```bash
GET /api/intents/:id
```

#### Approve Intent
```bash
POST /api/intents/:id/approve
Content-Type: application/json

{
  "approver": "CLIENT"  # or "WEALTH_MANAGER" or "BACKEND_CUSTODY"
}
```

#### Get Transaction Status
```bash
GET /api/transactions/:id/status
```

#### Get Audit Logs
```bash
GET /api/audit/logs?intentId=intent_xxx
GET /api/audit/logs?sessionId=session_xxx
GET /api/audit/logs?limit=50
```

### WebSocket Protocol

Connect to `ws://localhost:3001/mpc`

#### Client → Server Messages

**Join Session**
```json
{
  "type": "join",
  "payload": {
    "sessionId": "session_xxx",
    "role": "CLIENT",
    "publicKeyShare": "hex_encoded_public_share"
  }
}
```

**Ready to Sign**
```json
{
  "type": "ready",
  "payload": {}
}
```

**Nonce Commitment**
```json
{
  "type": "nonce_commit",
  "payload": {
    "sessionId": "session_xxx",
    "commitment": "hex_encoded_hash"
  }
}
```

**Nonce Reveal**
```json
{
  "type": "nonce_reveal",
  "payload": {
    "sessionId": "session_xxx",
    "nonce": "hex_encoded_nonce"
  }
}
```

**Partial Signature**
```json
{
  "type": "partial_sig",
  "payload": {
    "sessionId": "session_xxx",
    "partialSignature": "hex_encoded_partial_sig"
  }
}
```

#### Server → Client Messages

**Joined**
```json
{
  "type": "joined",
  "payload": {
    "clientId": "client_xxx",
    "participantCount": 2
  }
}
```

**Request Nonce Commitment**
```json
{
  "type": "request_nonce_commit",
  "payload": {
    "round": 1
  }
}
```

**Request Nonce Reveal**
```json
{
  "type": "request_nonce_reveal",
  "payload": {
    "round": 2
  }
}
```

**Request Partial Signature**
```json
{
  "type": "request_partial_sig",
  "payload": {
    "round": 3,
    "R": "hex_encoded_aggregated_nonce",
    "publicKey": "hex_encoded_public_key",
    "message": "hex_encoded_message"
  }
}
```

**Signature Ready**
```json
{
  "type": "signature_ready",
  "payload": {
    "signature": "hex_encoded_final_signature",
    "verified": true
  }
}
```

## Security

### Implemented Protections

- ✅ Nonce commit-reveal protocol prevents bias
- ✅ Replay attack prevention (single-use nonces)
- ✅ Double-approval prevention
- ✅ Session binding (participants validated)
- ✅ Signature verification before Hedera submission
- ✅ Input validation (account IDs, amounts, byte lengths)

### Production Considerations

For production deployment:
1. Replace in-memory storage with PostgreSQL/MongoDB
2. Add JWT authentication for REST API
3. Add TLS/WSS for WebSocket connections
4. Implement proper key management (HSM, KMS)
5. Add rate limiting and DDoS protection
6. Deploy to secure infrastructure with network isolation
7. Implement monitoring and alerting

## Testing

### Manual Testing

1. Start the server:
```bash
npm run dev
```

2. Create an intent:
```bash
curl -X POST http://localhost:3001/api/intents/create \
  -H "Content-Type: application/json" \
  -d '{
    "recipientAccountId": "0.0.123456",
    "amountHBAR": "10",
    "memo": "test payment"
  }'
```

3. Approve the intent (need 2 approvals):
```bash
curl -X POST http://localhost:3001/api/intents/INTENT_ID/approve \
  -H "Content-Type: application/json" \
  -d '{"approver": "CLIENT"}'

curl -X POST http://localhost:3001/api/intents/INTENT_ID/approve \
  -H "Content-Type: application/json" \
  -d '{"approver": "WEALTH_MANAGER"}'
```

4. Check audit logs:
```bash
curl http://localhost:3001/api/audit/logs?intentId=INTENT_ID
```

### WebSocket Testing

Use a WebSocket client (like `wscat`):

```bash
npm install -g wscat
wscat -c ws://localhost:3001/mpc
```

Then send JSON messages as documented above.

## License

Proprietary - All rights reserved
