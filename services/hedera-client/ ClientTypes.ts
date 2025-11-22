export interface HederaClientConfig {
    operatorId: string;
    operatorKey: string;
  }
  
  export interface AccountCreationResult {
    success: boolean;
    accountId: string;
    privateKey: string;
    publicKey: string;
  }
  
  export interface TopicResponse {
    topicId: string;
  }
  
  export interface TransactionResult {
    success: boolean;
    status?: string;
    transactionId?: string;
    error?: string;
  }