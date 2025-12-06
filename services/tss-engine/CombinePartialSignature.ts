import { Client, PrivateKey, PublicKey } from '@hashgraph/sdk';

export interface PartialSignature {
  id: number;
  signature: string;
}

export class CombinePartialSignatures {
  static combine(
    partialSignatures: PartialSignature[],
    publicKey: string,
    message: string,
  ): string {
    if (partialSignatures.length < 2) {
      throw new Error('At least 2 partial signatures are required to combine.');
    }

    // Verify each partial signature
    partialSignatures.forEach((sig) => {
      if (!this.verifyPartialSignature(sig, publicKey, message)) {
        throw new Error(`Invalid partial signature from ID ${sig.id}`);
      }
    });

    // Combine partial signatures into a full signature (mock combination)
    const combinedSignature = partialSignatures
      .map((sig) => sig.signature)
      .join('-combined-');

    return combinedSignature;
  }

  private static verifyPartialSignature(
    partialSignature: PartialSignature,
    publicKey: string,
    message: string,
  ): boolean {
    const pubKey = PublicKey.fromString(publicKey);
    const isValid = pubKey.verify(
      Buffer.from(message),
      Buffer.from(partialSignature.signature, 'hex'),
    );
    return isValid;
  }
}