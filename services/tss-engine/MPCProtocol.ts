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
        payload: `Aggregated-${msg.payload}`,
      }));
  
      return [...round1Messages, ...round2Messages];
    }
  
    private generatePartialSignature(message: string, share: string): string {
      // Mock partial signature generation
      return `PartialSig(${message})-from-${share}`;
    }
  }