import { orchestrator } from '../../services/container.js';
import { ParticipantRole } from '../../mpc/types.js';

export class IntentController {
    /**
     * Create new transaction intent
     */
    async createIntent(body: {
        recipientAccountId: string;
        amountHBAR: string;
        memo: string;
        creatorId?: string;
    }): Promise<any> {
        const { recipientAccountId, amountHBAR, memo, creatorId = 'api' } = body;

        if (!recipientAccountId || !amountHBAR) {
            throw new Error('recipientAccountId and amountHBAR are required');
        }

        const intent = await orchestrator.createIntent(
            recipientAccountId,
            amountHBAR,
            memo || '',
            creatorId
        );

        return {
            success: true,
            intent: {
                id: intent.id,
                recipientAccountId: intent.recipientAccountId,
                amountHBAR: intent.amountHBAR,
                memo: intent.memo,
                status: intent.status,
                approvals: intent.approvals,
                createdAt: intent.createdAt
            }
        };
    }

    /**
     * Get intent by ID
     */
    async getIntent(intentId: string): Promise<any> {
        const intent = orchestrator.getIntent(intentId);

        if (!intent) {
            return null;
        }

        return {
            intent: {
                id: intent.id,
                recipientAccountId: intent.recipientAccountId,
                amountHBAR: intent.amountHBAR,
                memo: intent.memo,
                status: intent.status,
                approvals: intent.approvals,
                createdAt: intent.createdAt
            }
        };
    }

    /**
     * Approve intent
     */
    async approveIntent(intentId: string, body: {
        approver: string;
    }): Promise<any> {
        const { approver } = body;

        if (!approver) {
            throw new Error('approver is required');
        }

        // Validate approver role
        const role = approver.toUpperCase() as ParticipantRole;
        if (!Object.values(ParticipantRole).includes(role)) {
            throw new Error(`Invalid approver role: ${approver}`);
        }

        const intent = await orchestrator.addApproval(intentId, role);

        return {
            success: true,
            intent: {
                id: intent.id,
                status: intent.status,
                approvals: intent.approvals,
                approvalCount: intent.approvals.length
            }
        };
    }

    /**
     * Execute intent (manual trigger)
     */
    async executeIntent(intentId: string): Promise<any> {
        const intent = orchestrator.getIntent(intentId);

        if (!intent) {
            throw new Error('Intent not found');
        }

        return {
            success: true,
            message: 'Intent execution triggered',
            intentId,
            status: intent.status
        };
    }
}
