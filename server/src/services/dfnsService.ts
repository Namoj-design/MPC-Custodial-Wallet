import { DfnsApiClient } from '@dfns/sdk';
import { AsymmetricKeySigner } from '@dfns/sdk-keysigner';

export const getDfnsClient = () => {
    const requiredEnvVars = [
        'DFNS_API_KEY',
        'DFNS_PRIVATE_KEY',
        'DFNS_CRED_ID',
        'DFNS_ORG_ID',
        'DFNS_BASE_URL'
    ];

    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            throw new Error(`DFNS CONFIG MISSING: ${envVar} is not set in the environment.`);
        }
    }

    if (process.env.DFNS_BASE_URL !== "https://api.dfns.io") {
        throw new Error('DFNS CONFIG MISSING: DFNS_BASE_URL must be "https://api.dfns.io"');
    }

    let privateKey = process.env.DFNS_PRIVATE_KEY!;
    if (privateKey) {
        privateKey = privateKey.replace(/\\n/g, '\n');
    }

    const signer = new AsymmetricKeySigner({
        credId: process.env.DFNS_CRED_ID!,
        privateKey: privateKey,
    });

    return new DfnsApiClient({
        baseUrl: process.env.DFNS_BASE_URL!,
        orgId: process.env.DFNS_ORG_ID!,
        authToken: process.env.DFNS_API_KEY!,
        signer,
    });
};

export const dfns = getDfnsClient();
