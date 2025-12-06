export interface MPCRequest {
    id: string;
    message: string;
    publicKey: string;
    amount: number;
    tokenId: string;
    isAdmin?: boolean; // Optional field for admin override
  }
  
  export interface MPCResponse {
    success: boolean;
    signature?: string;
    reason?: string;
  }
  
  export interface OrchestratorConfig {
    shardNodes: ShardNode[];
    policyRules: PolicyRules;
  }
  
  export interface ShardNode {
    id: string;
    weight: number;
    isOnline: boolean;
  }
  
  export interface PolicyRules {
    maxTransactionSize: number;
    allowedTokenIds: string[];
    dailyWithdrawalLimit: number;
    adminOverride: boolean;
  }
  
  export interface ShardSelectionResult {
    selectedShares: string[];
  }
