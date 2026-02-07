import { auditRepo } from '../../services/container.js';

export class AuditController {
    /**
     * Get audit logs with optional filters
     */
    async getAuditLogs(params: {
        intentId?: string;
        sessionId?: string;
        actorId?: string;
        limit?: number;
    }): Promise<any> {
        const { intentId, sessionId, actorId, limit = 100 } = params;

        let logs;

        if (intentId) {
            logs = auditRepo.findByIntentId(intentId);
        } else if (sessionId) {
            logs = auditRepo.findBySessionId(sessionId);
        } else if (actorId) {
            logs = auditRepo.findByActorId(actorId);
        } else {
            logs = auditRepo.findRecent(limit);
        }

        return {
            logs: logs.map(log => ({
                id: log.id,
                timestamp: log.timestamp,
                intentId: log.intentId,
                sessionId: log.sessionId,
                actorId: log.actorId,
                action: log.action,
                metadata: log.metadata
            })),
            count: logs.length
        };
    }
}
