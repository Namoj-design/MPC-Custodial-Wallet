 import { useEffect, useCallback } from 'react';
 import { broadcastSync } from '@/lib/broadcast-sync';
 
 type SyncEventType = 
   | 'TRANSACTION_CREATED'
   | 'TRANSACTION_APPROVED'
   | 'TRANSACTION_REJECTED'
   | 'TRANSACTION_EXECUTED'
   | 'TRANSACTION_UPDATED';
 
 interface SyncEvent {
   type: SyncEventType;
   payload: {
     transactionId: string;
     timestamp: number;
     data?: unknown;
   };
 }
 
 interface UseBroadcastSyncOptions {
   onTransactionCreated?: (transactionId: string, data?: unknown) => void;
   onTransactionApproved?: (transactionId: string, data?: unknown) => void;
   onTransactionRejected?: (transactionId: string, data?: unknown) => void;
   onTransactionExecuted?: (transactionId: string, data?: unknown) => void;
   onAnyEvent?: (event: SyncEvent) => void;
 }
 
 export function useBroadcastSync(options: UseBroadcastSyncOptions) {
   const {
     onTransactionCreated,
     onTransactionApproved,
     onTransactionRejected,
     onTransactionExecuted,
     onAnyEvent,
   } = options;
 
   useEffect(() => {
     const unsubscribe = broadcastSync.subscribe((event: SyncEvent) => {
       onAnyEvent?.(event);
       
       switch (event.type) {
         case 'TRANSACTION_CREATED':
           onTransactionCreated?.(event.payload.transactionId, event.payload.data);
           break;
         case 'TRANSACTION_APPROVED':
           onTransactionApproved?.(event.payload.transactionId, event.payload.data);
           break;
         case 'TRANSACTION_REJECTED':
           onTransactionRejected?.(event.payload.transactionId, event.payload.data);
           break;
         case 'TRANSACTION_EXECUTED':
           onTransactionExecuted?.(event.payload.transactionId, event.payload.data);
           break;
       }
     });
 
     return unsubscribe;
   }, [onTransactionCreated, onTransactionApproved, onTransactionRejected, onTransactionExecuted, onAnyEvent]);
 
   const emitCreated = useCallback((txId: string, data?: unknown) => {
     broadcastSync.emitTransactionCreated(txId, data);
   }, []);
 
   const emitApproved = useCallback((txId: string, data?: unknown) => {
     broadcastSync.emitTransactionApproved(txId, data);
   }, []);
 
   const emitRejected = useCallback((txId: string, data?: unknown) => {
     broadcastSync.emitTransactionRejected(txId, data);
   }, []);
 
   const emitExecuted = useCallback((txId: string, data?: unknown) => {
     broadcastSync.emitTransactionExecuted(txId, data);
   }, []);
 
   return {
     emitCreated,
     emitApproved,
     emitRejected,
     emitExecuted,
   };
 }