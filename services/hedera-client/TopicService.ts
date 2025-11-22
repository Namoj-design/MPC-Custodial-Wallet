import {
    TopicCreateTransaction,
    TopicMessageQuery,
    TopicMessageSubmitTransaction,
  } from "@hashgraph/sdk";
  import { HederaClient } from "./HederaClient";
import { TopicResponse } from "/Users/namojperiakumar/Desktop/MPC-Wallet/services/hedera-client/ ClientTypes.ts";
  
  export class TopicService {
    constructor(private hedera: HederaClient) {}
  
    async createTopic(): Promise<TopicResponse> {
      const tx = await new TopicCreateTransaction()
        .freezeWith(this.hedera.getClient())
        .execute(this.hedera.getClient());
  
      const receipt = await tx.getReceipt(this.hedera.getClient());
      return { topicId: receipt.topicId?.toString() || "" };
    }
  
    async publishMessage(topicId: string, message: string) {
      const tx = new TopicMessageSubmitTransaction({
        topicId,
        message,
      });
  
      const submit = await tx.execute(this.hedera.getClient());
      return submit.getReceipt(this.hedera.getClient());
    }
  
    subscribeToTopic(topicId: string, callback: (msg: any) => void) {
      new TopicMessageQuery()
        .setTopicId(topicId)
        .subscribe(this.hedera.getClient(), callback);
    }
  }