import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import { intentRoutes } from './routes/intentRoutes.js';
import { transactionRoutes } from './routes/transactionRoutes.js';
import { AuditController } from './controllers/auditController.js';

/**
 * Create and configure Fastify server
 */
export async function createServer(): Promise<FastifyInstance> {
    const fastify = Fastify({
        logger: {
            level: process.env.LOG_LEVEL || 'info'
        }
    });

    // CORS
    await fastify.register(import('@fastify/cors'), {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        credentials: true
    });

    // Health check
    fastify.get('/health', async () => {
        return { status: 'ok', timestamp: new Date().toISOString() };
    });

    // Register routes
    await fastify.register(intentRoutes);
    await fastify.register(transactionRoutes);

    // Audit logs route
    const auditController = new AuditController();
    fastify.get('/api/audit/logs', async (request, reply) => {
        try {
            const query = request.query as any;
            const result = await auditController.getAuditLogs(query);
            return reply.send(result);
        } catch (error) {
            return reply.status(400).send({
                error: (error as Error).message
            });
        }
    });

    return fastify;
}
