import { Client, AccountId, PrivateKey, Hbar } from '@hashgraph/sdk';

/**
 * Hedera client configuration for testnet
 */
export function createHederaClient(): Client {
    const network = process.env.HEDERA_NETWORK || 'testnet';
    const operatorId = process.env.HEDERA_OPERATOR_ID;
    const operatorKey = process.env.HEDERA_OPERATOR_KEY;

    if (!operatorId || !operatorKey) {
        throw new Error('HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY must be set');
    }

    let client: Client;

    if (network === 'testnet') {
        client = Client.forTestnet();
    } else if (network === 'mainnet') {
        client = Client.forMainnet();
    } else {
        throw new Error(`Unsupported network: ${network}`);
    }

    client.setOperator(
        AccountId.fromString(operatorId),
        PrivateKey.fromString(operatorKey)
    );

    // Set default transaction fee and query payment
    client.setDefaultMaxTransactionFee(new Hbar(1)); // 1 HBAR
    client.setDefaultMaxQueryPayment(new Hbar(0.5)); // 0.5 HBAR

    return client;
}

/**
 * Get MPC wallet account ID from environment
 */
export function getMPCAccountId(): AccountId {
    const accountId = process.env.HEDERA_MPC_ACCOUNT_ID;
    if (!accountId) {
        throw new Error('HEDERA_MPC_ACCOUNT_ID must be set');
    }
    return AccountId.fromString(accountId);
}

/**
 * Get MPC public key from environment
 */
export function getMPCPublicKey(): Uint8Array {
    const keyHex = process.env.HEDERA_MPC_PUBLIC_KEY;
    if (!keyHex) {
        throw new Error('HEDERA_MPC_PUBLIC_KEY must be set');
    }
    // Return raw bytes from hex
    return Buffer.from(keyHex, 'hex');
}
