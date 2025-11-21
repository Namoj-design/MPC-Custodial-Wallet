import { GenerateKeyShares, MPCProtocol, CombinePartialSignatures } from '../tss-engine';
import { ShardSelector } from './ShardSelector';
import { PolicyEngine } from './PolicyEngine';
import { RequestStateMachine } from './RequestStateMachine';
import {
  MPCRequest,
  MPCResponse,
  OrchestratorConfig,
  ShardSelectionResult,
} from './OrchestratorTypes';

export class Orchestrator {
  private readonly shardSelector: ShardSelector;
  private readonly policyEngine: PolicyEngine;
  private readonly stateMachine: RequestStateMachine;

  constructor(private config: OrchestratorConfig) {
    this.shardSelector = new ShardSelector(config.shardNodes);
    this.policyEngine = new PolicyEngine(config.policyRules);
    this.stateMachine = new RequestStateMachine();
  }

  async handleSigningRequest(request: MPCRequest): Promise<MPCResponse> {
    // Validate policy
    const policyResult = this.policyEngine.evaluate(request);
    if (!policyResult.allowed) {
      return { success: false, reason: policyResult.reason };
    }

    // Select shards
    const shardSelection: ShardSelectionResult = this.shardSelector.selectShards();
    const selectedShares = shardSelection.selectedShares;

    // Initialize MPC protocol
    const mpcProtocol = new MPCProtocol(selectedShares);

    // State: INIT → ROUND1
    this.stateMachine.transition(request.id, 'INIT', 'ROUND1');
    const round1Messages = await mpcProtocol.signMessage(request.message);

    // State: ROUND1 → ROUND2
    this.stateMachine.transition(request.id, 'ROUND1', 'ROUND2');
    const round2Messages = round1Messages.map((msg) => ({
      ...msg,
      payload: `Aggregated-${msg.payload}`, // Replace with real aggregation logic
    }));

    // Combine signatures
    const combinedSignature = CombinePartialSignatures.combine(
      round2Messages.map((msg) => ({ id: msg.senderId, signature: msg.payload })),
      request.publicKey,
      request.message,
    );

    // State: ROUND2 → COMBINE
    this.stateMachine.transition(request.id, 'ROUND2', 'COMBINE');

    return { success: true, signature: combinedSignature };
  }
}