import { FastifyReply } from 'fastify';
import { dfns } from '../../services/dfnsService';
import { prisma } from '../../db/postgres';
import { ApiRequest } from '../../types';
import { getAccountBalance } from '../../services/hederaService';

export async function createWallet(request: ApiRequest, reply: FastifyReply) {
    const userId = (request.user as any).id;

    try {
        console.log("DFNS wallet creation start");
        const wallet = await dfns.wallets.createWallet({
            body: {
                network: 'HederaTestnet',
            }
        });
        console.log("DFNS response:", wallet.id);

        const dbWallet = await prisma.wallet.create({
            data: {
                user: { connect: { id: userId } },
                dfns_wallet_id: wallet.id,
                hedera_address: wallet.address || '0.0.unknown',
            }
        });
        console.log("DB save success");

        return reply.send({ 
            success: true, 
            data: { ...dbWallet, public_key: wallet.signingKey?.publicKey || '' } 
        });
    } catch (error: any) {
        console.error("Wallet creation failed:", error);
        return reply.status(500).send({ success: false, error: 'Failed to create DFNS wallet' });
    }
}

export async function getWalletBalance(request: ApiRequest, reply: FastifyReply) {
    const { walletId } = request.query as { walletId: string };
    try {
        const wallet = await prisma.wallet.findUnique({
            where: { dfns_wallet_id: walletId }
        });
        
        if (!wallet) {
            return reply.code(404).send({ success: false, error: 'Wallet not found' });
        }

        let balance = 0;
        try {
            // Strictly isolated Hedera Mirror Node call
            balance = await getAccountBalance(wallet.hedera_address);
        } catch (mirrorErr) {
            console.error("Hedera Mirror Node failed:", mirrorErr);
            // DO NOT BREAK THE SYSTEM, return 0 smoothly
            balance = 0;
        }

        return reply.send({ success: true, data: { balance } });
    } catch (error: any) {
        console.error("Balance fetch failed:", error);
        return reply.code(500).send({ success: false, error: 'Failed to fetch balance' });
    }
}

export async function getWallets(request: ApiRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;
    if (!userId) return reply.send({ success: false, error: 'Unauthorized' });

    const wallets = await prisma.wallet.findMany({ where: { user_id: userId } });
    
    // Enrich the Prisma wallets with the live DFNS public keys
    const enrichedWallets = await Promise.all(wallets.map(async (w) => {
        try {
            const dfnsWallet = await dfns.wallets.getWallet({ walletId: w.dfns_wallet_id });
            return { ...w, public_key: dfnsWallet.signingKey?.publicKey || '' };
        } catch {
            return { ...w, public_key: '' };
        }
    }));

    return reply.send({ success: true, data: enrichedWallets });
}
