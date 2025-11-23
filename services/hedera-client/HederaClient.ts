import {
  Client,
  AccountId,
  PrivateKey,
  Hbar
} from "@hashgraph/sdk";
import { HederaClientConfig } from "./ClientTypes";

export class HederaClient {
  private client: Client;

  constructor(config: HederaClientConfig) {
    // Validate config
    if (!config.operatorId || !config.operatorKey) {
      console.warn("⚠ Hedera operator credentials missing — running in FAIL mode.");
      throw new Error("Missing Hedera operator credentials");
    }

    // Initialize network
    const network = config.network === "mainnet"
      ? Client.forMainnet()
      : config.network === "previewnet"
        ? Client.forPreviewnet()
        : Client.forTestnet();

    // Set operator
    network.setOperator(
      AccountId.fromString(config.operatorId),
      PrivateKey.fromString(config.operatorKey)
    );

    this.client = network;
  }

  /** Return Hedera client instance */
  getClient(): Client {
    return this.client;
  }

  /** Fetch account balance */
  async getBalance(accountId: string): Promise<string> {
    const acc = AccountId.fromString(accountId);
    const balance = await this.client.getAccountBalance(acc);
    return balance.hbars.toString();
  }

  /** Validate a private key format */
  static validateKey(key: string): boolean {
    try {
      PrivateKey.fromString(key);
      return true;
    } catch {
      return false;
    }
  }

  /** Validate account ID format */
  static validateAccountId(id: string): boolean {
    try {
      AccountId.fromString(id);
      return true;
    } catch {
      return false;
    }
  }

  /** Ping Hedera network */
  async ping(): Promise<boolean> {
    try {
      await this.client.ping(this.client.operatorAccountId!);
      return true;
    } catch {
      return false;
    }
  }

  /** Get operator info */
  getOperatorInfo() {
    return {
      accountId: this.client.operatorAccountId?.toString(),
      publicKey: this.client.operatorPublicKey?.toString()
    };
  }
}