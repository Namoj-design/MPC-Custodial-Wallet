
import { MPCEngine } from '../mpc/realEngine.js';
import { bytesToHex } from '../shared/utils/encoding.js';
import { PrivateKey } from '@hashgraph/sdk';
import fs from 'fs';
import path from 'path';

async function main() {
    console.log('Generating MPC keys and shares...');

    // 1. Generate 3 participants
    const p1 = MPCEngine.generateShare();
    const p2 = MPCEngine.generateShare();
    const p3 = MPCEngine.generateShare(); // Backend

    // 2. Combine public keys to get the aggregate public key
    const aggregatePublicKey = MPCEngine.combinePublicKeys([
        p1.publicShare,
        p2.publicShare,
        p3.publicShare
    ]);

    console.log('Aggregate Public Key (Hex):', bytesToHex(aggregatePublicKey));

    // 3. Generate Hedera Operator (dummy for testnet)
    const operatorKey = PrivateKey.generateED25519();
    const operatorId = "0.0.12345"; // Dummy

    // 4. MPC Account ID (dummy)
    const mpcAccountId = "0.0.67890";

    // 5. Create .env content
    const envContent = `
PORT=3001
HOST=0.0.0.0
NODE_ENV=development

# Hedera Testnet Config
HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=${operatorId}
HEDERA_OPERATOR_KEY=${operatorKey.toString()}

# MPC Wallet Config
HEDERA_MPC_ACCOUNT_ID=${mpcAccountId}
HEDERA_MPC_PUBLIC_KEY=${bytesToHex(aggregatePublicKey)}

# Server MPC Identity (Participant 3)
MPC_BACKEND_SHARE=${bytesToHex(p3.privateShare)}
MPC_BACKEND_PUBLIC_SHARE=${bytesToHex(p3.publicShare)}

# Participant 1 (Client) - For reference/client usage
# SHARE: ${bytesToHex(p1.privateShare)}
# PUB: ${bytesToHex(p1.publicShare)}

# Participant 2 (Wealth Manager) - For reference/client usage
# SHARE: ${bytesToHex(p2.privateShare)}
# PUB: ${bytesToHex(p2.publicShare)}
`.trim();

    const envPath = path.resolve(process.cwd(), '.env');
    fs.writeFileSync(envPath, envContent);

    console.log(`✅ .env file generated at ${envPath}`);

    // Save client shares to a separate file for the test script
    const testConfig = {
        p1: {
            privateShare: bytesToHex(p1.privateShare),
            publicShare: bytesToHex(p1.publicShare)
        },
        p2: {
            privateShare: bytesToHex(p2.privateShare),
            publicShare: bytesToHex(p2.publicShare)
        },
        backend: {
            publicShare: bytesToHex(p3.publicShare)
        }
    };

    fs.writeFileSync('test-shares.json', JSON.stringify(testConfig, null, 2));
    console.log('✅ test-shares.json generated');
}

main().catch(console.error);
