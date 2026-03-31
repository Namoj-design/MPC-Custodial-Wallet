import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
    registerStart, registerComplete,
    loginStart, loginComplete,
    managerStart, managerVerify
} from '../controllers/authController';

export async function authRoutes(fastify: FastifyInstance) {
    // Client (DFNS Passkey) routes
    fastify.post('/register/start', registerStart);
    fastify.post('/register/complete', registerComplete);

    fastify.post('/login/start', loginStart);
    fastify.post('/login/complete', loginComplete);

    // Wealth Manager (OTP) routes
    fastify.post('/manager/otp', managerStart);
    fastify.post('/manager/verify', managerVerify);
}
