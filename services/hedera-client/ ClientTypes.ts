export interface HederaClientConfig {
  operatorId: string;
  operatorKey: string;
  network?: "mainnet" | "testnet" | "previewnet"; // fallback just in case no 
                                                  //network is specified
}

export interface AccountCreationResult {
  success: boolean;
  accountId: string;
  privateKey: string;
  publicKey: string;
}

export interface TopicResponse {
  topicId: string;
  success: boolean;
  error?: string;
}

export interface TransactionResult {
  success: boolean;
  status?: string;
  transactionId?: string;
  error?: string;
}