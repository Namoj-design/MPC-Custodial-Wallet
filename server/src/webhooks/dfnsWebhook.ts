import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../db/postgres';
import { getWsService } from '../services/websocketService';

export async function dfnsWebhookHandler(request: FastifyRequest, reply: FastifyReply) {
    // Normally we would verify the webhook signature here using DFNS public key
    const payload = request.body as any;

    try {
        if (payload.event === 'transaction.broadcasted') {
            const tx = await prisma.transaction.updateMany({
                where: { sender_wallet_id: payload.data.walletId, status: 'SIGNING' },
                data: { status: 'BROADCASTED', hedera_tx_id: payload.data.hash }
            });
            // Emit socket event if we had the internal ID, but since we update many, we might need to find it first.
        } else if (payload.event === 'transaction.confirmed') {
            const tx = await prisma.transaction.updateMany({
                where: { sender_wallet_id: payload.data.walletId, status: 'BROADCASTED' },
                data: { status: 'CONFIRMED' }
            });
        }

        // Since this is a simple webhook, we can just broadcast an untargeted refresh or find the actual tx and broadcast it
        getWsService().broadcast('WEBHOOK_EVENT', payload);

        return reply.status(200).send({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return reply.status(500).send({ error: 'Internal Server Error' });
    }
}

export async function webhookRoutes(fastify: import('fastify').FastifyInstance) {
    fastify.post('/dfns', dfnsWebhookHandler);
}
