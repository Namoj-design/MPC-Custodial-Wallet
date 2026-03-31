import { FastifyInstance } from 'fastify';
import { requireClient, requireManager, authMiddleware } from '../../middleware/authMiddleware';
import { createTransactionIntent, getPendingTransactions, approveTransaction, getTransactions, getAuditLogs, getTransaction, rejectTransaction } from '../controllers/transactionController';

export async function transactionRoutes(fastify: FastifyInstance) {
    fastify.post('/', { preHandler: [requireClient] }, createTransactionIntent);
    fastify.get('/pending', { preHandler: [requireManager] }, getPendingTransactions);
    fastify.get('/', { preHandler: [authMiddleware] }, getTransactions);
    fastify.get('/logs', { preHandler: [requireManager] }, getAuditLogs);
    fastify.get('/:id', { preHandler: [authMiddleware] }, getTransaction);
    fastify.post('/:id/approve', { preHandler: [requireManager] }, approveTransaction);
    fastify.post('/:id/reject', { preHandler: [requireManager] }, rejectTransaction);
}
