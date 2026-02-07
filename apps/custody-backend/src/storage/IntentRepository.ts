import { Intent, IntentStatus, ApprovalRecord, ParticipantRole } from '../mpc/types.js';
import { randomBytes } from 'crypto';

/**
 * In-memory intent repository (DB-ready architecture)
 */
export class IntentRepository {
    private intents: Map<string, Intent> = new Map();

    create(data: {
        recipientAccountId: string;
        amountHBAR: string;
        memo: string;
    }): Intent {
        const intent: Intent = {
            id: this.generateId(),
            sessionId: undefined,
            recipientAccountId: data.recipientAccountId,
            amountHBAR: data.amountHBAR,
            memo: data.memo,
            createdAt: new Date(),
            status: IntentStatus.PENDING,
            approvals: []
        };

        this.intents.set(intent.id, intent);
        return intent;
    }

    findById(id: string): Intent | undefined {
        return this.intents.get(id);
    }

    update(id: string, updates: Partial<Intent>): Intent | undefined {
        const intent = this.intents.get(id);
        if (!intent) {
            return undefined;
        }

        const updated = { ...intent, ...updates };
        this.intents.set(id, updated);
        return updated;
    }

    addApproval(intentId: string, approver: ParticipantRole): Intent | undefined {
        const intent = this.intents.get(intentId);
        if (!intent) {
            return undefined;
        }

        // Check for duplicate approval
        if (intent.approvals.some(a => a.approver === approver)) {
            throw new Error(`${approver} has already approved this intent`);
        }

        const approval: ApprovalRecord = {
            approver,
            timestamp: new Date()
        };

        intent.approvals.push(approval);
        this.intents.set(intentId, intent);
        return intent;
    }

    getApprovalCount(intentId: string): number {
        const intent = this.intents.get(intentId);
        return intent ? intent.approvals.length : 0;
    }

    hasApprovalThreshold(intentId: string, threshold: number = 2): boolean {
        return this.getApprovalCount(intentId) >= threshold;
    }

    list(): Intent[] {
        return Array.from(this.intents.values());
    }

    private generateId(): string {
        return `intent_${randomBytes(16).toString('hex')}`;
    }
}
