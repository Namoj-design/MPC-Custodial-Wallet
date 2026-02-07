import type { FastifyInstance } from 'fastify';
import { TransactionController } from '../controllers/transactionController.js';

export async function transactionRoutes(fastify: FastifyInstance): Promise<void> {
    const controller = new TransactionController();

    // Get transaction status
    fastify.get('/api/transactions/:id/status', async (request, reply) => {
        try {
            const params = request.params as any;
            const result = await controller.getTransactionStatus(params.id);

            if (!result) {
                return reply.status(404).send({ error: 'Transaction not found' });
            }

            return reply.send(result);
        } catch (error) {
            return reply.status(400).send({
                error: (error as Error).message
            });
        }
    });
}
