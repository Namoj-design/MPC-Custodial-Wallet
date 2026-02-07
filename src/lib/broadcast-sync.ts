// BroadcastChannel for cross-tab real-time sync
const CHANNEL_NAME = 'mpc-custody-sync';

const SOURCE_ID =
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
 
 type SyncEventType = 
   | 'TRANSACTION_CREATED'
   | 'TRANSACTION_APPROVED'
   | 'TRANSACTION_REJECTED'
   | 'TRANSACTION_EXECUTED'
   | 'TRANSACTION_UPDATED';
 
interface SyncEvent {
  sourceId: string;
   type: SyncEventType;
   payload: {
     transactionId: string;
     timestamp: number;
     data?: unknown;
   };
 }
 
 type SyncCallback = (event: SyncEvent) => void;
 
 class BroadcastSync {
   private channel: BroadcastChannel | null = null;
   private subscribers: Set<SyncCallback> = new Set();
   private isSupported: boolean;
 
   constructor() {
     this.isSupported = typeof BroadcastChannel !== 'undefined';
     
     if (this.isSupported) {
       this.channel = new BroadcastChannel(CHANNEL_NAME);
       this.channel.onmessage = (event: MessageEvent<SyncEvent>) => {
          if (event.data?.sourceId === SOURCE_ID) return;
          this.notifySubscribers(event.data);
       };
     }
   }
 
   subscribe(callback: SyncCallback): () => void {
     this.subscribers.add(callback);
     return () => {
       this.subscribers.delete(callback);
     };
   }
 
  broadcast(event: Omit<SyncEvent, 'sourceId'>): void {
    if (!this.channel) return;
    this.channel.postMessage({ ...event, sourceId: SOURCE_ID });
   }
 
   private notifySubscribers(event: SyncEvent): void {
     this.subscribers.forEach(callback => {
       try {
         callback(event);
       } catch (error) {
         console.error('Error in sync subscriber:', error);
       }
     });
   }
 
   // Convenience methods for common events
   emitTransactionCreated(transactionId: string, data?: unknown): void {
     this.broadcast({
       type: 'TRANSACTION_CREATED',
       payload: { transactionId, timestamp: Date.now(), data },
     });
   }
 
   emitTransactionApproved(transactionId: string, data?: unknown): void {
     this.broadcast({
       type: 'TRANSACTION_APPROVED',
       payload: { transactionId, timestamp: Date.now(), data },
     });
   }
 
   emitTransactionRejected(transactionId: string, data?: unknown): void {
     this.broadcast({
       type: 'TRANSACTION_REJECTED',
       payload: { transactionId, timestamp: Date.now(), data },
     });
   }
 
   emitTransactionExecuted(transactionId: string, data?: unknown): void {
     this.broadcast({
       type: 'TRANSACTION_EXECUTED',
       payload: { transactionId, timestamp: Date.now(), data },
     });
   }

  emitTransactionUpdated(transactionId: string, data?: unknown): void {
    this.broadcast({
      type: 'TRANSACTION_UPDATED',
      payload: { transactionId, timestamp: Date.now(), data },
    });
  }
 }
 
 // Singleton instance
 export const broadcastSync = new BroadcastSync();