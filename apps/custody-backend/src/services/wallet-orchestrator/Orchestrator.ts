import { IntentRepository } from '../../storage/IntentRepository.js';
import { TransactionRepository } from '../../storage/TransactionRepository.js';
import { AuditRepository } from '../../storage/AuditRepository.js';
import { ApprovalTracker } from './ApprovalTracker.js';
import { PolicyEngine } from './PolicyEngine.js';
import { RequestStateMachine } from './RequestStateMachine.js';
import { TransactionAudit } from '../../shared/audit/transactionAudit.js';
import { Intent, IntentStatus, ParticipantRole } from '../../mpc/types.js';
import type { MPCWebSocketServer } from '../../mpc/ws.js';
import { ExecutionService } from '../../hedera/executionService.js';

/**
 * Main orchestrator coordinating intent flow and MPC signing
 */
export class Orchestrator {
    private approvalTracker: ApprovalTracker;
    private policyEngine: PolicyEngine;
    private transactionAudit: TransactionAudit;
    private mpcServer?: MPCWebSocketServer;

    constructor(
        private intentRepo: IntentRepository,
        private transactionRepo: TransactionRepository,
        auditRepo: AuditRepository,
        private executionService: ExecutionService
    ) {
        this.approvalTracker = new ApprovalTracker();
        this.policyEngine = new PolicyEngine();
        this.transactionAudit = new TransactionAudit(auditRepo);
    }

    /**
     * Set MPC WebSocket server reference
     */
    setMPCServer(server: MPCWebSocketServer): void {
        this.mpcServer = server;
        this.mpcServer.setSignatureReadyCallback((sessionId, intentId, signature) => {
            this.handleSignatureReady(sessionId, intentId, signature);
        });
    }

    /**
     * Create new transaction intent
     */
    async createIntent(
        recipientAccountId: string,
        amountHBAR: string,
        memo: string,
        creatorId: string
    ): Promise<Intent> {
        // Validate intent
        this.policyEngine.validateIntent(recipientAccountId, amountHBAR, memo);

        // Create intent
        const intent = this.intentRepo.create({
            recipientAccountId,
            amountHBAR,
            memo
        });

        // Audit log
        this.transactionAudit.logIntentCreated(
            intent.id,
            creatorId,
            recipientAccountId,
            amountHBAR
        );

        return intent;
    }

    /**
     * Add approval to intent
     */
    async addApproval(intentId: string, approver: ParticipantRole): Promise<Intent> {
        // Validate participant
        this.policyEngine.validateParticipant(approver);

        // Get intent
        const intent = this.intentRepo.findById(intentId);
        if (!intent) {
            throw new Error(`Intent not found: ${intentId}`);
        }

        // Check if already terminal
        if (RequestStateMachine.isTerminal(intent.status)) {
            throw new Error(`Intent is in terminal state: ${intent.status}`);
        }

        // Add approval
        this.approvalTracker.addApproval(intentId, approver);
        this.intentRepo.addApproval(intentId, approver);

        // Audit log
        this.transactionAudit.logApprovalReceived(intentId, approver);

        // Check threshold
        const thresholdReached = this.approvalTracker.hasThreshold(intentId, 2);

        if (thresholdReached && intent.status === IntentStatus.PENDING) {
            // Update status to APPROVED
            const newStatus = RequestStateMachine.getStateAfterApproval(intent.status, true);
            const updatedIntent = this.intentRepo.update(intentId, { status: newStatus });

            if (updatedIntent) {
                this.transactionAudit.logIntentStatusChanged(intentId, intent.status, newStatus);

                // Trigger MPC signing
                await this.triggerMPCSigning(intentId);

                return updatedIntent;
            }
        }

        return this.intentRepo.findById(intentId)!;
    }

    /**
     * Trigger MPC signing ceremony
     */
    private async triggerMPCSigning(intentId: string): Promise<void> {
        const intent = this.intentRepo.findById(intentId);
        if (!intent) {
            throw new Error(`Intent not found: ${intentId}`);
        }

        // Create transaction record
        this.transactionRepo.create(intentId);

        // Update intent status
        const newStatus = RequestStateMachine.getStateAfterSigningStarted(intent.status);
        this.intentRepo.update(intentId, { status: newStatus });

        // Audit log
        this.transactionAudit.logIntentStatusChanged(intent.status, intent.status, newStatus);

        // Notify MPC server to initiate signing
        // The MPC WebSocket server will handle the session coordination
        console.log(`[Orchestrator] Triggering MPC signing for intent ${intentId}`);

        if (this.mpcServer) {
            try {
                // Build transaction bytes
                const { bytes } = await this.executionService.buildFrozenTransaction(intent);

                // For MVP, we use a fixed MPC public key derived from env 
                // in a real system this would come from the MPC setup
                const mpcPublicKey = this.executionService['mpcPublicKey']; // Accessing for MVP session creation

                // Create signing session
                const sessionId = this.mpcServer.createSigningSession(intentId, bytes, mpcPublicKey);
                console.log(`[Orchestrator] MPC session created for intent ${intentId}: ${sessionId}`);

                // Store sessionId in intent so clients can join
                this.intentRepo.update(intentId, { sessionId });
            } catch (error) {
                console.error(`[Orchestrator] Failed to initiate MPC signing:`, error);
                await this.markTransactionFailed(intentId, (error as Error).message);
            }
        } else {
            console.warn('[Orchestrator] MPC Server not set, cannot initiate signing');
        }
    }

    /**
     * Get intent by ID
     */
    getIntent(intentId: string): Intent | undefined {
        return this.intentRepo.findById(intentId);
    }

    /**
     * Get all intents
     */
    getAllIntents(): Intent[] {
        return this.intentRepo.list();
    }

    /**
     * Mark transaction as submitted
     */
    async markTransactionSubmitted(
        intentId: string,
        hederaTxId: string,
        signature: Uint8Array
    ): Promise<void> {
        const txRecord = this.transactionRepo.findByIntentId(intentId);
        if (!txRecord) {
            throw new Error(`Transaction not found for intent: ${intentId}`);
        }

        this.transactionRepo.markSubmitted(txRecord.id, hederaTxId, signature);

        // Update intent status
        const intent = this.intentRepo.findById(intentId);
        if (intent) {
            const newStatus = RequestStateMachine.getStateAfterSubmission(intent.status);
            this.intentRepo.update(intentId, { status: newStatus });
            this.transactionAudit.logIntentStatusChanged(intentId, intent.status, newStatus);
        }

        // Audit log
        this.transactionAudit.logTransactionSubmitted(
            intentId,
            hederaTxId,
            signature.toString()
        );
    }

    /**
     * Mark transaction as confirmed
     */
    async markTransactionConfirmed(intentId: string, receipt: unknown): Promise<void> {
        const txRecord = this.transactionRepo.findByIntentId(intentId);
        if (!txRecord) {
            throw new Error(`Transaction not found for intent: ${intentId}`);
        }

        this.transactionRepo.markSuccess(txRecord.id, receipt);

        // Audit log
        this.transactionAudit.logTransactionConfirmed(
            intentId,
            txRecord.hederaTxId || '',
            'SUCCESS'
        );
    }

    /**
     * Mark transaction as failed
     */
    async markTransactionFailed(intentId: string, error: string): Promise<void> {
        const txRecord = this.transactionRepo.findByIntentId(intentId);
        if (txRecord) {
            this.transactionRepo.markFailed(txRecord.id, error);
        }

        // Update intent status
        const intent = this.intentRepo.findById(intentId);
        if (intent) {
            const newStatus = RequestStateMachine.getStateAfterFailure(intent.status);
            this.intentRepo.update(intentId, { status: newStatus });
            this.transactionAudit.logIntentStatusChanged(intentId, intent.status, newStatus);
        }

        // Audit log
        this.transactionAudit.logTransactionFailed(intentId, error);
    }

    /**
     * Handle signature ready event from MPC server
     */
    async handleSignatureReady(sessionId: string, intentId: string, signature: Uint8Array): Promise<void> {
        console.log(`[Orchestrator] Signature received for intent ${intentId} from session ${sessionId}`);

        try {
            const intent = this.intentRepo.findById(intentId);
            if (!intent) {
                console.error(`[Orchestrator] Intent not found for signature: ${intentId}`);
                return;
            }

            // Re-build transaction
            const { transaction } = await this.executionService.buildFrozenTransaction(intent);

            // Submit
            const { txId, receipt } = await this.executionService.submitSignedTransaction(transaction, signature);

            // Mark confirmed
            await this.markTransactionSubmitted(intentId, txId, signature);
            await this.markTransactionConfirmed(intentId, receipt);

            console.log(`[Orchestrator] Transaction ${txId} confirmed for intent ${intentId}`);

        } catch (error) {
            console.error(`[Orchestrator] Failed to submit transaction for intent ${intentId}:`, error);
            await this.markTransactionFailed(intentId, (error as Error).message);
        }
    }
}
