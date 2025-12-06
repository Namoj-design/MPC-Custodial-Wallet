import { MPCProtocol, CombinePartialSignatures } from '../tss-engine/index';
import { ShardSelector } from '/Users/namojperiakumar/Desktop/MPC-Wallet/services/wallet-orchestrator/ShardSelector.ts';
import { PolicyEngine } from '/Users/namojperiakumar/Desktop/MPC-Wallet/services/wallet-orchestrator/PolicyEngine.ts';
import { RequestStateMachine } from '/Users/namojperiakumar/Desktop/MPC-Wallet/services/wallet-orchestrator/RequestStateMachine.ts';
import {
  MPCRequest,
  MPCResponse,
  OrchestratorConfig,
  ShardSelectionResult,
} from '/Users/namojperiakumar/Desktop/MPC-Wallet/services/wallet-orchestrator/OrchestratorTypes.ts';

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
    try {
      // Validate policy
      const policyResult = this.policyEngine.evaluate(request);
      if (!policyResult.allowed) {
        return { success: false, reason: policyResult.reason };
      }

      // Select shards
      const shardSelection: ShardSelectionResult = this.shardSelector.selectShards();
      const selectedShares = shardSelection.selectedShares;

      if (selectedShares.length < 2) {
        throw new Error('Not enough shards available for signing');
      }

      // Initialize MPC protocol
      const mpcProtocol = new MPCProtocol(selectedShares);

      // State: INIT → ROUND1
      this.stateMachine.transition(request.id, 'INIT', 'ROUND1');
      const round1Messages = await mpcProtocol.signMessage(request.message);

      // State: ROUND1 → ROUND2
      this.stateMachine.transition(request.id, 'ROUND1', 'ROUND2');
      const round2Messages = await this.processRound2(mpcProtocol, round1Messages);

      // Combine signatures
      const partials = round2Messages.map((msg) => ({
        id: msg.senderId,
        signature: msg.payload,
      }));
      const combinedSignature = CombinePartialSignatures.combine(
        partials,
        request.publicKey,
        request.message,
      );

      // State: ROUND2 → COMBINE
      this.stateMachine.transition(request.id, 'ROUND2', 'COMBINE');

      return { success: true, signature: combinedSignature };
    } catch (error) {
      console.error('Error handling signing request:', error);
      return { success: false, reason: 'Signing request failed' };
    }
  }

  private async processRound2(
    mpcProtocol: MPCProtocol,
    round1Messages: any[],
  ): Promise<any[]> {
    try {
      const round2Messages = round1Messages.map((msg) => ({
        ...msg,
        payload: `Processed-${msg.payload}`, // Replace with real round 2 processing logic
      }));
      return round2Messages;
    } catch (error) {
      console.error('Error processing round 2 messages:', error);
      throw new Error('Failed to process round 2 messages');
    }
  }
}