import { PublicKey, AccountId } from '@hashgraph/sdk';
import type { SignerSignature } from '@hashgraph/sdk';

/**
 * Custom MPC signer for Hedera SDK
 * Coordinates MPC signing ceremony to generate Ed25519 signature
 */
export class MPCSigner {
    constructor(
        private publicKey: Uint8Array,
        private signFunction: (message: Uint8Array) => Promise<Uint8Array>
    ) { }

    /**
     * Get the public key for this signer
     */
    getPublicKey(): PublicKey {
        return PublicKey.fromBytes(this.publicKey);
    }

    /**
     * Sign a message using MPC ceremony
     */
    async sign(message: Uint8Array): Promise<Uint8Array> {
        console.log(`[MPCSigner] Signing ${message.length} bytes`);
        const signature = await this.signFunction(message);
        console.log(`[MPCSigner] Generated signature: ${signature.length} bytes`);
        return signature;
    }

    /**
     * Get account public key
     */
    getAccountKey(): PublicKey {
        return this.getPublicKey();
    }

    /**
     * Sign transaction (used by Hedera SDK)
     */
    async signTransaction(transaction: Uint8Array): Promise<SignerSignature> {
        const signature = await this.sign(transaction);

        return {
            publicKey: this.getPublicKey(),
            signature,
            accountId: null as unknown as AccountId
        };
    }
}
