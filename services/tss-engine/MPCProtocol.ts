import { PrivateKey } from '@hashgraph/sdk';
import * as secrets from 'secrets.js';

export interface MPCMessage {
  round: number;
  senderId: number;
  payload: string;
}

export class MPCProtocol {
  private readonly shares: string[];

  constructor(shares: string[]) {
    this.shares = shares;
  }

  async signMessage(message: string): Promise<MPCMessage[]> {
    try {
      // Round 1: Generate partial signatures
      const round1Messages = this.shares.map((share, index) => ({
        round: 1,
        senderId: index + 1,
        payload: this.generatePartialSignature(message, share),
      }));

      // Round 2: Aggregate partial signatures
      const round2Messages = round1Messages.map((msg) => ({
        round: 2,
        senderId: msg.senderId,
        payload: `Aggregated-${msg.payload}`, // Replace with real aggregation logic
      }));

      return [...round1Messages, ...round2Messages];
    } catch (error) {
      console.error('Error during MPC signing:', error);
      throw new Error('MPC signing failed');
    }
  }

  private generatePartialSignature(message: string, share: string): string {
    try {
      // Reconstruct the private key from the share
      const reconstructedKeyHex = secrets.combine([share]);
      if (!reconstructedKeyHex || reconstructedKeyHex.length !== 64) {
        throw new Error('Invalid reconstructed private key');
      }

      const privateKey = PrivateKey.fromString(reconstructedKeyHex);

      // Sign the message
      const signature = privateKey.sign(Buffer.from(message));
      return Buffer.from(signature).toString('hex'); // Convert Uint8Array to hex string
    } catch (error) {
      console.error('Error generating partial signature:', error);
      throw new Error('Partial signature generation failed');
    }
  }
}