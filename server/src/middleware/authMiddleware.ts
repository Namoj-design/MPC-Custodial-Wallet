import { FastifyRequest, FastifyReply } from 'fastify';
import { admin } from '../services/firebaseAdmin';
import { prisma } from '../db/postgres';

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
    try {
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return reply.status(401).send({ success: false, error: 'Unauthorized: Missing token' });
        }

        const token = authHeader.split('Bearer ')[1];
        
        // Verify Firebase ID token
        const decodedToken = await admin.auth().verifyIdToken(token);
        const { uid, email } = decodedToken;

        let user = await prisma.user.findUnique({ where: { firebase_uid: uid } });
        
        if (!user && email) {
            user = await prisma.user.findUnique({ where: { email } });
            if (user) {
                user = await prisma.user.update({
                    where: { email },
                    data: { firebase_uid: uid }
                });
            }
        }

        if (!user) {
            return reply.status(401).send({ success: false, error: 'Unauthorized: User not found in DB' });
        }

        (request as any).user = {
            id: user.id,
            userId: user.id,
            firebase_uid: user.firebase_uid,
            email: user.email,
            role: user.role,
            dfns_user_id: user.dfns_user_id
        };

    } catch (error) {
        console.error("Auth Middleware Error:", error);
        return reply.status(401).send({ success: false, error: 'Invalid Token' });
    }
}

export async function requireManager(request: FastifyRequest, reply: FastifyReply) {
    await authMiddleware(request, reply);
    if (reply.sent) return;
    if ((request as any).user?.role !== 'WEALTH_MANAGER') {
        return reply.status(403).send({ success: false, error: 'Forbidden: Managers only' });
    }
}

export async function requireClient(request: FastifyRequest, reply: FastifyReply) {
    await authMiddleware(request, reply);
    if (reply.sent) return;
    if ((request as any).user?.role !== 'CLIENT') {
        return reply.status(403).send({ success: false, error: 'Forbidden: Clients only' });
    }
}
