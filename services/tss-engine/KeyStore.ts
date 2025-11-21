export interface KeyStore {
    saveKeyShare(id: number, share: string): Promise<void>;
    getKeyShare(id: number): Promise<string | null>;
  }
  
  export class InMemoryKeyStore implements KeyStore {
    private store: Map<number, string> = new Map();
  
    async saveKeyShare(id: number, share: string): Promise<void> {
      this.store.set(id, share);
    }
  
    async getKeyShare(id: number): Promise<string | null> {
      return this.store.get(id) || null;
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