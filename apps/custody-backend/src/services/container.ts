import { IntentRepository } from '../storage/IntentRepository.js';
import { TransactionRepository } from '../storage/TransactionRepository.js';
import { AuditRepository } from '../storage/AuditRepository.js';
import { Orchestrator } from './wallet-orchestrator/Orchestrator.js';
import { ExecutionService } from '../hedera/executionService.js';
import { createHederaClient, getMPCPublicKey } from '../hedera/client.js';

// Singleton instances
export const intentRepo = new IntentRepository();
export const transactionRepo = new TransactionRepository();
export const auditRepo = new AuditRepository();

// Hedera Services
// Note: These rely on environment variables being loaded
const hederaClient = createHederaClient();
const mpcPublicKey = getMPCPublicKey();
export const executionService = new ExecutionService(hederaClient, mpcPublicKey);

export const orchestrator = new Orchestrator(intentRepo, transactionRepo, auditRepo, executionService);
