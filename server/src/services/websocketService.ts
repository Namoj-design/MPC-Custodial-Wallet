import { WebSocket } from 'ws';

export class WebSocketService {
    private clients: Set<WebSocket> = new Set();

    constructor() {}

    handleConnection(ws: WebSocket) {
        this.clients.add(ws);
        console.log(`[WS] Client connected. Total: ${this.clients.size}`);
        
        ws.on('close', () => {
            this.clients.delete(ws);
            console.log(`[WS] Client disconnected. Total: ${this.clients.size}`);
        });

        // Reply to pings if the client sends { "type": "ping" }
        ws.on('message', (data) => {
            try {
                const msg = JSON.parse(data.toString());
                if (msg.type === 'ping') {
                    ws.send(JSON.stringify({ type: 'pong' }));
                }
            } catch (err) {
                // Ignore parse errors on ping
            }
        });
    }

    broadcast(event: string, payload: any) {
        const message = JSON.stringify({ event, payload });
        this.clients.forEach((client) => {
            if (client.readyState === 1) { // OPEN
                client.send(message);
            }
        });
    }
}

let wsService: WebSocketService;

export function initWebSocket() {
    wsService = new WebSocketService();
}

export function getWsService() {
    if (!wsService) throw new Error("WebSocket service not initialized");
    return wsService;
}
