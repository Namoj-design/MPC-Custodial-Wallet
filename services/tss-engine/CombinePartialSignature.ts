import * as crypto from 'crypto';

export interface PartialSignature {
  id: number;
  signature: string;
}

export class CombinePartialSignatures {
  static combine(partialSignatures: PartialSignature[]): string {
    if (partialSignatures.length < 2) {
      throw new Error('At least 2 partial signatures are required to combine.');
    }

    // Verify each partial signature (mock verification)
    partialSignatures.forEach((sig) => {
      if (!this.verifyPartialSignature(sig)) {
        throw new Error(`Invalid partial signature from ID ${sig.id}`);
      }
    });

    // Combine partial signatures into a full signature (mock combination)
    const combinedSignature = partialSignatures
      .map((sig) => sig.signature)
      .join('-combined-');

    return combinedSignature;
  }

  private static verifyPartialSignature(partialSignature: PartialSignature): boolean {
    // Mock verification logic
    return partialSignature.signature.startsWith('PartialSig');
  }
}