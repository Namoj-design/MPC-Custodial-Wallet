import { FastifyRequest, FastifyReply } from 'fastify';
import { dfns } from '../../services/dfnsService';
import { prisma } from '../../db/postgres';
import { signToken } from '../../utils/jwt';
import { generateOtp, verifyOtp } from '../../services/otpService';

export async function registerStart(request: FastifyRequest, reply: FastifyReply) {
    const { email, role } = request.body as { email: string; role: 'CLIENT' | 'WEALTH_MANAGER' };

    if (role !== 'CLIENT') {
        return reply.status(400).send({ success: false, error: 'Only CLIENT can use WebAuthn register' });
    }

    try {
        const challenge: any = await (dfns.auth as any).createDelegatedRegistrationChallenge({
            body: { kind: 'EndUser', email }
        });
        return reply.send({ success: true, data: { challengeId: challenge.temporaryAuthenticationToken, challenge: challenge.challenge } });
    } catch (error: any) {
        return reply.status(500).send({ success: false, error: error.message });
    }
}

export async function registerComplete(request: FastifyRequest, reply: FastifyReply) {
    const { challengeId, credential } = request.body as any;

    try {
        const result: any = await (dfns.auth as any).createCredential({
            body: {
                credentialKind: 'Fido2',
                credentialName: 'Passkey',
                challengeIdentifier: challengeId,
                credentialInfo: {
                    credId: credential.id,
                    clientData: credential.response.clientDataJSON,
                    attestationData: credential.response.attestationObject,
                }
            }
        });

        // Decode temporary token to get userId and email
        let dfnsUserId = '';
        let email = `user_${Date.now()}@dfns.ninja`;
        try {
            const payload = JSON.parse(Buffer.from(challengeId.split('.')[1], 'base64').toString());
            dfnsUserId = payload.sub || '';
            email = payload.email || email;
        } catch (e) { }

        const user = await prisma.user.create({
            data: {
                email,
                role: 'CLIENT',
                dfns_user_id: dfnsUserId,
            }
        });

        const token = signToken({ userId: user.id, role: 'CLIENT', dfnsUserId: user.dfns_user_id || undefined });
        return reply.send({ success: true, data: { userId: user.id, token } });

    } catch (error: any) {
        return reply.status(500).send({ success: false, error: error.message });
    }
}

export async function loginStart(request: FastifyRequest, reply: FastifyReply) {
    const { email } = request.body as { email: string };

    try {
        // We need the dfns_user_id to create a login challenge in DFNS or we can use email.
        // In DFNS SDK, you can create a login challenge without userId if needed, 
        // but typically you need to locate the user first or use username.
        // For pure passkey conditional UI, `dfns.auth.createLoginChallenge` might just take an empty body.
        const challenge: any = await (dfns.auth as any).createLoginChallenge({
            body: { orgId: process.env.DFNS_APP_ID || '', username: email }
        });
        return reply.send({ success: true, data: { challengeId: challenge.challengeIdentifier || challenge.challengeId || 'temp_id', challenge: challenge.challenge } });
    } catch (error: any) {
        return reply.status(400).send({ success: false, error: error.message });
    }
}

export async function loginComplete(request: FastifyRequest, reply: FastifyReply) {
    const { challengeId, credential } = request.body as any;

    try {
        const result: any = await (dfns.auth as any).login({
            body: {
                challengeIdentifier: challengeId,
                firstFactor: {
                    kind: 'Fido2',
                    credentialAssertion: {
                        credId: credential.id,
                        clientData: credential.response.clientDataJSON,
                        authenticatorData: credential.response.authenticatorData,
                        signature: credential.response.signature,
                        userHandle: credential.response.userHandle || undefined,
                    }
                }
            }
        });

        // Find the user by DFNS user ID or email if returned
        const dfnsUserId = result.userActionPayload?.userId;
        const user = await prisma.user.findUnique({ where: { dfns_user_id: dfnsUserId } });

        if (!user) {
            return reply.status(404).send({ success: false, error: 'User not found in local DB' });
        }

        const token = signToken({ userId: user.id, role: user.role as any, dfnsUserId: user.dfns_user_id || undefined });

        // Check if wallet exists
        const wallet = await prisma.wallet.findFirst({ where: { user_id: user.id } });

        return reply.send({ success: true, data: { userId: user.id, token, walletId: wallet?.dfns_wallet_id } });
    } catch (error: any) {
        return reply.status(400).send({ success: false, error: error.message });
    }
}

export async function managerStart(request: FastifyRequest, reply: FastifyReply) {
    const { email } = request.body as { email: string };
    try {
        const otp = await generateOtp(email);
        console.log(`[DEV ONLY] Manager OTP for ${email}: ${otp}`);
        return reply.send({ success: true });
    } catch (error: any) {
        return reply.status(500).send({ success: false, error: error.message });
    }
}

export async function managerVerify(request: FastifyRequest, reply: FastifyReply) {
    const { email, otp } = request.body as { email: string, otp: string };
    try {
        const isValid = await verifyOtp(email, otp);
        if (!isValid) return reply.status(401).send({ success: false, error: 'Invalid or expired OTP' });

        // Ensure manager exists
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            user = await prisma.user.create({
                data: { email, role: 'WEALTH_MANAGER' }
            });
        } else if (user.role !== 'WEALTH_MANAGER') {
            return reply.status(403).send({ success: false, error: 'User is not a manager' });
        }

        const token = signToken({ userId: user.id, role: 'WEALTH_MANAGER' });
        return reply.send({ success: true, data: { userId: user.id, token } });
    } catch (error: any) {
        return reply.status(500).send({ success: false, error: error.message });
    }
}
