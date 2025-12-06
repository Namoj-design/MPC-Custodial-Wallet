import {
  Client,
  AccountId,
  PrivateKey,
  Hbar,
  TransferTransaction,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  AccountBalanceQuery,
} from "@hashgraph/sdk";

import { HederaClientConfig } from "/Users/namojperiakumar/Desktop/MPC-Wallet/services/hedera-client/ ClientTypes";

export class HederaClient {
  private client: Client;

  constructor(config: HederaClientConfig) {
    if (!config.operatorId || !config.operatorKey) {
      throw new Error("❌ Missing Hedera operator credentials");
    }

    const network =
      config.network === "mainnet"
        ? Client.forMainnet()
        : config.network === "previewnet"
        ? Client.forPreviewnet()
        : Client.forTestnet();

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
  async getAccountBalance(accountId: string): Promise<string> {
    const balance = await new AccountBalanceQuery()
      .setAccountId(AccountId.fromString(accountId))
      .execute(this.client);

    return balance.hbars.toString();
  }

  /** Transfer HBAR */
  async transferHbar(
    from: string,
    to: string,
    amount: number
  ) {
    const tx = await new TransferTransaction()
      .addHbarTransfer(from, new Hbar(-amount))
      .addHbarTransfer(to, new Hbar(amount))
      .execute(this.client);

    const receipt = await tx.getReceipt(this.client);

    return {
      success: receipt.status.toString() === "SUCCESS",
      transactionId: tx.transactionId.toString(),
      status: receipt.status.toString(),
    };
  }

  /** Create a new Consensus Topic */
  async createTopic() {
    const tx = await new TopicCreateTransaction().execute(this.client);
    const receipt = await tx.getReceipt(this.client);

    return {
      success: true,
      topicId: receipt.topicId?.toString(),
    };
  }

  /** Publish message to topic */
  async publishMessage(topicId: string, message: string) {
    const tx = await new TopicMessageSubmitTransaction({
      topicId,
      message,
    }).execute(this.client);

    const receipt = await tx.getReceipt(this.client);

    return {
      success: receipt.status.toString() === "SUCCESS",
      status: receipt.status.toString(),
    };
  }

  /** Validate private key */
  static validateKey(key: string): boolean {
    try {
      PrivateKey.fromString(key);
      return true;
    } catch {
      return false;
    }
  }

  /** Validate account ID */
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
      publicKey: this.client.operatorPublicKey?.toString(),
    };
  }
}