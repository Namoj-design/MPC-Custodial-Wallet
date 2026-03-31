import { FastifyInstance } from 'fastify';
import { requireClient, authMiddleware } from '../../middleware/authMiddleware';
import { createWallet, getWalletBalance, getWallets } from '../controllers/walletController';

export async function walletRoutes(fastify: FastifyInstance) {
    fastify.post('/create', { preHandler: [requireClient] }, createWallet);
    fastify.get('/balance', { preHandler: [authMiddleware] }, getWalletBalance);
    fastify.get('/list', { preHandler: [authMiddleware] }, getWallets);
    fastify.get('/my', { preHandler: [authMiddleware] }, getWallets); // Alias
}
