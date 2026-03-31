// WebSocket client for real-time DFNS transaction lifecycle updates

import { getWsUrl } from '@/lib/config';

export type DFNSWebSocketEvent =
  | 'WALLET_CREATED'
  | 'TRANSACTION_CREATED'
  | 'TRANSACTION_APPROVED'
  | 'SIGNING_STARTED'
  | 'SIGNATURE_COMPLETED'
  | 'TRANSACTION_BROADCASTED'
  | 'TRANSACTION_CONFIRMED'
  | 'TRANSACTION_FAILED'
  | 'TRANSACTION_REJECTED';

export interface DFNSWebSocketMessage {
  event: DFNSWebSocketEvent;
  transactionId?: string;
  walletId?: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

type MessageHandler = (message: DFNSWebSocketMessage) => void;

class WebSocketClient {
  private socket: WebSocket | null = null;
  private handlers: Set<MessageHandler> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private pingInterval: ReturnType<typeof setInterval> | null = null;

  connect(): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return;
    }

    this.disconnect();

    try {
      const url = getWsUrl();
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        console.log('[DFNS WebSocket] Connected to', url);
        this.reconnectAttempts = 0;
        this.startPing();
      };

      this.socket.onmessage = (event) => {
        try {
          const message: DFNSWebSocketMessage = JSON.parse(event.data);
          this.notifyHandlers(message);
        } catch (error) {
          console.error('[DFNS WebSocket] Failed to parse message:', error);
        }
      };

      this.socket.onclose = (event) => {
        console.log(`[DFNS WebSocket] Disconnected: ${event.code}`);
        this.stopPing();
        if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.socket.onerror = (error) => {
        console.error('[DFNS WebSocket] Error:', error);
      };
    } catch (error) {
      console.error('[DFNS WebSocket] Connection failed:', error);
      this.scheduleReconnect();
    }
  }

  private startPing(): void {
    this.stopPing();
    this.pingInterval = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
  }

  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    console.log(`[DFNS WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    setTimeout(() => this.connect(), delay);
  }

  disconnect(): void {
    this.stopPing();
    if (this.socket) {
      this.socket.close(1000, 'Client disconnect');
      this.socket = null;
    }
  }

  subscribe(handler: MessageHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  private notifyHandlers(message: DFNSWebSocketMessage): void {
    this.handlers.forEach((handler) => {
      try {
        handler(message);
      } catch (error) {
        console.error('[DFNS WebSocket] Handler error:', error);
      }
    });
  }

  get isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
export const dfnsWebSocket = new WebSocketClient();
