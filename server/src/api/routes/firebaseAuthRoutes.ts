import { FastifyInstance } from 'fastify';
import { verifyToken, setRole } from '../controllers/firebaseAuthController';
import { authMiddleware } from '../../middleware/authMiddleware';

export async function firebaseAuthRoutes(fastify: FastifyInstance) {
    fastify.post('/verify', verifyToken);
    
    // Protected route to get current user
    fastify.get('/me', { preHandler: [authMiddleware] }, async (request, reply) => {
        return reply.send({ success: true, data: (request as any).user });
    });

    // Protected route to set role (if needed during signup)
    fastify.post('/register-role', { preHandler: [authMiddleware] }, setRole);
}
