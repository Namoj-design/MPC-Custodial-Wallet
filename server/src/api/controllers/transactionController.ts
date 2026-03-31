import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../../db/postgres';
import { ApiRequest } from '../../types';
import { executeHederaTransfer } from '../../services/hederaService';
import { getWsService } from '../../services/websocketService';

export async function createTransactionIntent(request: ApiRequest, reply: FastifyReply) {
    const { recipientAccountId, amount } = request.body as any;
    const { userId } = request.user!;

    try {
        const wallet = await prisma.wallet.findFirst({ where: { user_id: userId } });
        if (!wallet) {
            return reply.status(400).send({ success: false, error: 'You must create a DFNS wallet first' });
        }

        const tx = await prisma.transaction.create({
            data: {
                sender_wallet_id: wallet.dfns_wallet_id,
                receiver_address: recipientAccountId,
                amount: Number(amount),
                status: 'PENDING',
                created_by: userId,
            }
        });

        getWsService().broadcast('TRANSACTION_CREATED', tx);

        return reply.send({ success: true, data: tx });
    } catch (error: any) {
        return reply.status(500).send({ success: false, error: error.message });
    }
}

export async function getPendingTransactions(request: ApiRequest, reply: FastifyReply) {
    try {
        const txs = await prisma.transaction.findMany({ where: { status: 'PENDING' } });
        return reply.send({ success: true, data: txs });
    } catch (error: any) {
        return reply.status(500).send({ success: false, error: error.message });
    }
}

export async function approveTransaction(request: ApiRequest, reply: FastifyReply) {
    const { id } = request.params as any;
    const { userId, role } = request.user!;

    if (role !== 'WEALTH_MANAGER') {
        return reply.status(403).send({ success: false, error: 'Only Managers can approve' });
    }

    try {
        let tx = await prisma.transaction.findUnique({ where: { id } });
        if (!tx || tx.status !== 'PENDING') {
            return reply.status(400).send({ success: false, error: 'Transaction not found or not pending' });
        }

        // Mark as signing
        tx = await prisma.transaction.update({
            where: { id },
            data: { status: 'SIGNING', approved_by: userId }
        });

        getWsService().broadcast('MANAGER_APPROVED', tx);
        getWsService().broadcast('SIGNING', tx);

        // Execute Hedera Tx
        let dfnsResponse: any;
        let hederaTxId: string;
        
        try {
            // Look up wallet to get sender address
            const wallet = await prisma.wallet.findUnique({ where: { dfns_wallet_id: tx.sender_wallet_id } });
            if (!wallet) throw new Error(`Wallet not found for ID: ${tx.sender_wallet_id}`);

            const result = await executeHederaTransfer(
                wallet.dfns_wallet_id,
                wallet.hedera_address,
                tx.receiver_address,
                tx.amount
            );
            dfnsResponse = result.dfnsResponse;
            hederaTxId = result.hederaTxId;
        } catch (execError: any) {
            tx = await prisma.transaction.update({
                where: { id },
                data: { status: 'FAILED' }
            });
            await prisma.auditLog.create({
                data: {
                    transaction_id: tx.id,
                    client_id: tx.created_by,
                    manager_id: userId,
                    signature: `0xFAILED: ${execError.message.substring(0, 100)}`,
                    hedera_tx_id: 'N/A'
                }
            });
            getWsService().broadcast('TRANSACTION_FAILED', tx);
            return reply.status(400).send({ success: false, error: `Broadcast Failed: ${execError.message}` });
        }

        // Extract DFNS returned parameters
        const finalSignature = dfnsResponse.signature || dfnsResponse.id || "0x0000";
        const dfnsSigId = dfnsResponse.id;

        // Store confirmed details
        tx = await prisma.transaction.update({
            where: { id },
            data: {
                status: 'CONFIRMED',
                final_signature: finalSignature,
                dfns_signature_id: dfnsSigId,
                hedera_tx_id: hederaTxId
            }
        });

        getWsService().broadcast('SIGNATURE_COMPLETED', tx);
        getWsService().broadcast('TRANSACTION_CONFIRMED', tx);

        // Insert native mathematically proven log into AuditLog
        await prisma.auditLog.create({
            data: {
                transaction_id: tx.id,
                client_id: tx.created_by,
                manager_id: userId,
                signature: finalSignature,
                hedera_tx_id: hederaTxId,
            }
        });

        getWsService().broadcast('TRANSACTION_BROADCASTED', tx);

        return reply.send({ success: true, data: tx });
    } catch (error: any) {
        return reply.status(500).send({ success: false, error: error.message });
    }
}

export async function getTransactions(request: ApiRequest, reply: FastifyReply) {
    const { userId, role } = request.user!;
    try {
        const txs = role === 'CLIENT' 
            ? await prisma.transaction.findMany({ where: { created_by: userId }, orderBy: { created_at: 'desc' } })
            : await prisma.transaction.findMany({ orderBy: { created_at: 'desc' } });
        return reply.send({ success: true, data: txs });
    } catch (error: any) {
        return reply.status(500).send({ success: false, error: error.message });
    }
}

export async function getTransaction(request: ApiRequest, reply: FastifyReply) {
    const { id } = request.params as any;
    try {
        const tx = await prisma.transaction.findUnique({ where: { id } });
        if (!tx) return reply.status(404).send({ success: false, error: 'Not found' });
        return reply.send({ success: true, data: tx });
    } catch (error: any) {
        return reply.status(500).send({ success: false, error: error.message });
    }
}

export async function rejectTransaction(request: ApiRequest, reply: FastifyReply) {
    const { id } = request.params as any;
    const { userId } = request.user!;
    
    try {
        const tx = await prisma.transaction.update({
            where: { id },
            data: { status: 'REJECTED', approved_by: userId }
        });
        getWsService().broadcast('TRANSACTION_REJECTED', tx);
        
        await prisma.auditLog.create({
            data: {
                transaction_id: tx.id,
                client_id: tx.created_by,
                manager_id: userId,
                signature: '0xREJECTED',
                hedera_tx_id: 'N/A'
            }
        });
        
        return reply.send({ success: true, data: tx });
    } catch (error: any) {
        return reply.status(500).send({ success: false, error: error.message });
    }
}

export async function getAuditLogs(request: ApiRequest, reply: FastifyReply) {
    try {
        const logs = await prisma.auditLog.findMany({ orderBy: { timestamp: 'desc' } });
        return reply.send({ success: true, data: logs });
    } catch (error: any) {
        return reply.status(500).send({ success: false, error: error.message });
    }
}
