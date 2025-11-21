import * as crypto from 'crypto';

export interface KeyStore {
  saveKeyShare(id: number, share: string): Promise<void>;
  getKeyShare(id: number): Promise<string | null>;
}

export class InMemoryKeyStore implements KeyStore {
  private store: Map<number, string> = new Map();

  async saveKeyShare(id: number, share: string): Promise<void> {
    this.store.set(id, this.encryptShare(share));
  }

  async getKeyShare(id: number): Promise<string | null> {
    const encryptedShare = this.store.get(id);
    return encryptedShare ? this.decryptShare(encryptedShare) : null;
  }

  private encryptShare(share: string): string {
    const cipher = crypto.createCipher('aes-256-cbc', 'encryption-key');
    let encrypted = cipher.update(share, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  private decryptShare(encryptedShare: string): string {
    const decipher = crypto.createDecipher('aes-256-cbc', 'encryption-key');
    let decrypted = decipher.update(encryptedShare, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}

export class SecureKeyStore implements KeyStore {
  async saveKeyShare(id: number, share: string): Promise<void> {
    // Placeholder for secure storage (e.g., encrypted file or database)
    console.log(`Saving key share securely: ID=${id}`);
  }

  async getKeyShare(id: number): Promise<string | null> {
    // Placeholder for secure retrieval
    console.log(`Retrieving key share securely: ID=${id}`);
    return null;
  }
}