import type { FastifyInstance } from 'fastify';
import { IntentController } from '../controllers/intentController.js';

export async function intentRoutes(fastify: FastifyInstance): Promise<void> {
    const controller = new IntentController();

    // Create intent
    fastify.post('/api/intents/create', async (request, reply) => {
        try {
            const body = request.body as any;
            const result = await controller.createIntent(body);
            return reply.status(201).send(result);
        } catch (error) {
            return reply.status(400).send({
                error: (error as Error).message
            });
        }
    });

    // Get intent by ID
    fastify.get('/api/intents/:id', async (request, reply) => {
        try {
            const params = request.params as any;
            const result = await controller.getIntent(params.id);

            if (!result) {
                return reply.status(404).send({ error: 'Intent not found' });
            }

            return reply.send(result);
        } catch (error) {
            return reply.status(400).send({
                error: (error as Error).message
            });
        }
    });

    // Approve intent
    fastify.post('/api/intents/:id/approve', async (request, reply) => {
        try {
            const params = request.params as any;
            const body = request.body as any;
            const result = await controller.approveIntent(params.id, body);
            return reply.send(result);
        } catch (error) {
            return reply.status(400).send({
                error: (error as Error).message
            });
        }
    });

    // Execute intent (trigger signing)
    fastify.post('/api/intents/:id/execute', async (request, reply) => {
        try {
            const params = request.params as any;
            const result = await controller.executeIntent(params.id);
            return reply.send(result);
        } catch (error) {
            return reply.status(400).send({
                error: (error as Error).message
            });
        }
    });
}
