import { useEffect, useCallback, useState } from 'react';
import { dfnsWebSocket, DFNSWebSocketMessage, DFNSWebSocketEvent } from '@/lib/websocketClient';

interface UseWebSocketOptions {
  onEvent?: (event: DFNSWebSocketEvent, payload: Record<string, unknown>) => void;
  autoConnect?: boolean;
}

export function useWebSocket({ onEvent, autoConnect = true }: UseWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<DFNSWebSocketMessage | null>(null);

  useEffect(() => {
    if (autoConnect) {
      dfnsWebSocket.connect();
    }

    const handleMessage = (message: DFNSWebSocketMessage) => {
      setLastEvent(message);
      onEvent?.(message.event, message.payload);
    };

    const unsubscribe = dfnsWebSocket.subscribe(handleMessage);

    const interval = setInterval(() => {
      setIsConnected(dfnsWebSocket.isConnected);
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [onEvent, autoConnect]);

  const disconnect = useCallback(() => {
    dfnsWebSocket.disconnect();
    setIsConnected(false);
  }, []);

  return {
    isConnected,
    lastEvent,
    disconnect,
  };
}
