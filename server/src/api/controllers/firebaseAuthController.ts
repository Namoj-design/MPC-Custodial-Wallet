import { FastifyRequest, FastifyReply } from 'fastify';
import { admin } from '../../services/firebaseAdmin';
import { prisma } from '../../db/postgres';
import { dfns } from '../../services/dfnsService'; // If you want to automatically create a DFNS user

export async function verifyToken(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({ success: false, error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    const { uid, email } = decodedToken;
    if (!email) {
      return reply.code(400).send({ success: false, error: 'Email not found in Firebase token' });
    }

    // Check if user exists by firebase_uid
    let user = await prisma.user.findUnique({ where: { firebase_uid: uid } });
    
    if (!user) {
      // Check if user exists by email
      user = await prisma.user.findUnique({ where: { email } });
      
      if (user) {
        // Link firebase_uid
        user = await prisma.user.update({
          where: { email },
          data: { firebase_uid: uid }
        });
      } else {
        // Create new user (Role depends on user selection later)
        user = await prisma.user.create({
          data: {
            email,
            firebase_uid: uid,
            role: 'NONE' // Requires setting role after sign-in
          }
        });
      }
    }

    // Check if they have a wallet registered
    const wallet = await prisma.wallet.findFirst({ where: { user_id: user.id } });

    return reply.send({
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        role: user.role,
        firebase_uid: user.firebase_uid,
        dfns_user_id: user.dfns_user_id,
        walletId: wallet?.dfns_wallet_id
      }
    });

  } catch (error: any) {
    console.error('Verify Token Error:', error);
    return reply.code(401).send({ success: false, error: `Invalid token: ${error.message}` });
  }
}

export async function setRole(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { role } = request.body as { role: 'CLIENT' | 'WEALTH_MANAGER' };
    const reqUser = (request as any).user; // Set by authMiddleware
    
    if (!['CLIENT', 'WEALTH_MANAGER'].includes(role)) {
      return reply.code(400).send({ success: false, error: 'Invalid role' });
    }

    if (reqUser.role && reqUser.role !== 'NONE') {
      return reply.code(400).send({ success: false, error: 'Role already set for this user' });
    }

    const user = await prisma.user.update({
      where: { id: reqUser.id },
      data: { role }
    });

    return reply.send({
      success: true,
      data: {
        userId: user.id,
        role: user.role,
      }
    });

  } catch (error: any) {
    console.error('Set Role Error:', error);
    return reply.code(500).send({ success: false, error: 'Internal server error' });
  }
}
