import * as crypto from 'crypto';

export interface KeyStore {
  saveKeyShare(id: number, share: string): Promise<void>;
  getKeyShare(id: number): Promise<string | null>;
}

export class InMemoryKeyStore implements KeyStore {
  private store: Map<number, string> = new Map();
  private readonly algorithm = 'aes-256-cbc';
  private readonly key = crypto.randomBytes(32); // 256-bit key
  private readonly iv = crypto.randomBytes(16); // 128-bit IV

  async saveKeyShare(id: number, share: string): Promise<void> {
    this.store.set(id, this.encryptShare(share));
  }

  async getKeyShare(id: number): Promise<string | null> {
    const encryptedShare = this.store.get(id);
    return encryptedShare ? this.decryptShare(encryptedShare) : null;
  }

  private encryptShare(share: string): string {
    const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
    let encrypted = cipher.update(share, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${this.iv.toString('hex')}:${encrypted}`; // Store IV with the encrypted data
  }

  private decryptShare(encryptedShare: string): string {
    const [ivHex, encrypted] = encryptedShare.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}