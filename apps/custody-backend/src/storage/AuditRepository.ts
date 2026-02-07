import { AuditLog } from '../mpc/types.js';
import { randomBytes } from 'crypto';

/**
 * In-memory audit log repository (DB-ready architecture)
 */
export class AuditRepository {
    private logs: AuditLog[] = [];

    log(data: {
        intentId?: string;
        sessionId?: string;
        actorId?: string;
        action: string;
        metadata?: Record<string, unknown>;
    }): AuditLog {
        const entry: AuditLog = {
            id: this.generateId(),
            timestamp: new Date(),
            intentId: data.intentId,
            sessionId: data.sessionId,
            actorId: data.actorId,
            action: data.action,
            metadata: data.metadata
        };

        this.logs.push(entry);
        return entry;
    }

    findByIntentId(intentId: string): AuditLog[] {
        return this.logs.filter(log => log.intentId === intentId);
    }

    findBySessionId(sessionId: string): AuditLog[] {
        return this.logs.filter(log => log.sessionId === sessionId);
    }

    findByActorId(actorId: string): AuditLog[] {
        return this.logs.filter(log => log.actorId === actorId);
    }

    findAll(): AuditLog[] {
        return [...this.logs];
    }

    findRecent(limit: number = 100): AuditLog[] {
        return this.logs.slice(-limit);
    }

    private generateId(): string {
        return `audit_${randomBytes(16).toString('hex')}`;
    }
}
