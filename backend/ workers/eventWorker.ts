// backend/workers/eventWorker.ts

import { jobQueue } from "./queue";
import {
  BaseJob,
  JobType,
  TopicPublishJobPayload,
} from "./types";
import { HederaClient } from "/Users/namojperiakumar/Desktop/MPC-Wallet/services/hedera-client/HederaClient";
import { TopicService } from "/Users/namojperiakumar/Desktop/MPC-Wallet/services/hedera-client/TopicService";

const TOPIC_PUBLISH_TYPE: JobType = "TOPIC_PUBLISH";

export class EventWorker {
  private isProcessing = false;
  private topicService: TopicService;

  constructor(hederaClient: HederaClient) {
    this.topicService = new TopicService(hederaClient);
  }

  async processNext(): Promise<void> {
    if (this.isProcessing) return;

    this.isProcessing = true;
    try {
      const job = jobQueue.dequeue();
      if (!job || job.type !== TOPIC_PUBLISH_TYPE) {
        this.isProcessing = false;
        return;
      }

      await this.handleTopicJob(job as BaseJob<TopicPublishJobPayload>);
    } finally {
      this.isProcessing = false;
    }
  }

  private async handleTopicJob(
    job: BaseJob<TopicPublishJobPayload>
  ): Promise<void> {
    try {
      const { topicId, message } = job.payload;

      const receipt = await this.topicService.publishMessage(
        topicId,
        message
      );

      // eslint-disable-next-line no-console
      console.log(
        "[EventWorker] Topic message published",
        job.id,
        topicId,
        receipt.status.toString()
      );
    } catch (err) {
      if (job.attempts < job.maxAttempts) {
        jobQueue.requeue(job, 5_000);
      } else {
        // eslint-disable-next-line no-console
        console.error(
          "[EventWorker] Failed to publish message, dropping job",
          job.id,
          err
        );
      }
    }
  }
}