import * as secrets from 'secrets.js';
import { Client, PrivateKey, PublicKey } from '@hashgraph/sdk';

export interface KeyShare {
  id: number;
  share: string;
}

export interface KeyGenerationResult {
  publicKey: string;
  shares: KeyShare[];
}

export class GenerateKeyShares {
  static generateThresholdKeyShares(): KeyGenerationResult {
    // Generate a random private key using Hedera SDK
    const privateKey = PrivateKey.generate();
    const publicKey = privateKey.publicKey.toString();

    // Split the private key into 3 shares using Shamir's Secret Sharing
    const secretHex = privateKey.toStringRaw(); // Convert private key to hex
    const shares = secrets.share(secretHex, 3, 2); // 3 shares, 2 required to reconstruct

    // Map shares to KeyShare format
    const keyShares: KeyShare[] = shares.map((share, index) => ({
      id: index + 1,
      share,
    }));

    return {
      publicKey,
      shares: keyShares,
    };
  }
}