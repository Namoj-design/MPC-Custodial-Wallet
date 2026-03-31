import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { firebaseAuthRoutes } from './api/routes/firebaseAuthRoutes';
import { walletRoutes } from './api/routes/walletRoutes';
import { transactionRoutes } from './api/routes/transactionRoutes';
import { webhookRoutes } from './webhooks/dfnsWebhook';
import { getWsService } from './services/websocketService';

export async function buildServer() {
    const app = Fastify({ logger: true });

    await app.register(cors, {
        origin: '*',
    });

    await app.register(websocket);

    app.get('/health', async () => {
        return { status: 'ok' };
    });

    // WebSocket Route
    app.get('/ws', { websocket: true }, (connection, req) => {
        // Since fastify 9+, connection is a socket object, but wait, fastify-websocket v11 provides `connection.socket`
        getWsService().handleConnection(connection as any);
    });

    app.register(firebaseAuthRoutes, { prefix: '/api/auth' });
    app.register(walletRoutes, { prefix: '/api/wallet' });
    app.register(transactionRoutes, { prefix: '/api/transactions' });
    app.register(webhookRoutes, { prefix: '/api/webhooks' });

    return app;
}
