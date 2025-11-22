import {
    Client,
    AccountId,
    PrivateKey,
  } from "@hashgraph/sdk";
  import { HederaClientConfig } from "/Users/namojperiakumar/Desktop/MPC-Wallet/services/hedera-client/ ClientTypes.ts";
  
  export class HederaClient {
    private client: Client;
  
    constructor(config: HederaClientConfig) {
      if (!config.operatorId || !config.operatorKey) {
        throw new Error("Missing Hedera operator credentials");
      }
  
      this.client = Client.forTestnet();
      this.client.setOperator(
        AccountId.fromString(config.operatorId),
        PrivateKey.fromString(config.operatorKey)
      );
    }
  
    getClient(): Client {
      return this.client;
    }
  }