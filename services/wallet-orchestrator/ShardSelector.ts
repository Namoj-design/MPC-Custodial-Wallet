export interface ShardNode {
    id: string;
    weight: number;
    isOnline: boolean;
  }
  
  export interface ShardSelectionResult {
    selectedShares: string[];
  }
  
  export class ShardSelector {
    private readonly shardNodes: ShardNode[];
  
    constructor(shardNodes: ShardNode[]) {
      this.shardNodes = shardNodes;
    }
  
    selectShards(): ShardSelectionResult {
      const onlineNodes = this.shardNodes.filter((node) => node.isOnline);
      if (onlineNodes.length < 2) {
        throw new Error('Not enough online shard nodes for selection');
      }
  
      // Randomly select 2 nodes
      const selectedNodes = onlineNodes
        .sort(() => Math.random() - 0.5)
        .slice(0, 2);
  
      return {
        selectedShares: selectedNodes.map((node) => node.id),
      };
    }
  }