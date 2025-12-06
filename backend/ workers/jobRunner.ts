// backend/workers/jobRunner.ts

import { jobQueue } from "./queue";
import {
  BaseJob,
  JobType,
  MPCSignJobPayload,
  TopicPublishJobPayload,
  MPCOrchestrator,
  MPCSignResult,
} from "./types";
import { MPCWorker } from "./mpcWorker";
import { EventWorker } from "./eventWorker";
import { HederaClient } from "/Users/namojperiakumar/Desktop/MPC-Wallet/services/hedera-client/HederaClient";

function createStubMPCOrchestrator(): MPCOrchestrator  {
  // TODO: wire this to your real wallet-orchestrator service.
  return {
    async signWithMPC(
      payload: MPCSignJobPayload
    ): Promise<MPCSignResult> {
      // eslint-disable-next-line no-console
      console.log(
        "[StubMPCOrchestrator] Signing with MPC for request",
        payload.requestId
      );
      return {
        success: true,
        signature: "stub-signature",
      };
    },
  };
}

export class JobRunner {
  private mpcWorker: MPCWorker;
  private eventWorker: EventWorker;

  constructor() {
    const hederaClient = new HederaClient({
      operatorId: process.env.HEDERA_OPERATOR_ID || "",
      operatorKey: process.env.HEDERA_OPERATOR_KEY || "",
    });

    const orchestrator = createStubMPCOrchestrator();

    this.mpcWorker = new MPCWorker(orchestrator);
    this.eventWorker = new EventWorker(hederaClient);
  }

  start(): void {
    // Simple polling loop. In production you’d scale this as separate processes.
    setInterval(() => {
      void this.mpcWorker.processNext();
      void this.eventWorker.processNext();
    }, 1_000);

    // eslint-disable-next-line no-console
    console.log("[JobRunner] Workers started");
  }

  enqueueMpcSignJob(payload: MPCSignJobPayload): void {
    const job: BaseJob<MPCSignJobPayload> = {
      id: `mpc_${Date.now()}`,
      type: "MPC_SIGN" as JobType,
      payload,
      attempts: 0,
      maxAttempts: 5,
      createdAt: new Date(),
      scheduledAt: new Date(),
    };
    jobQueue.enqueue(job);
  }

  enqueueTopicPublishJob(payload: TopicPublishJobPayload): void {
    const job: BaseJob<TopicPublishJobPayload> = {
      id: `topic_${Date.now()}`,
      type: "TOPIC_PUBLISH" as JobType,
      payload,
      attempts: 0,
      maxAttempts: 5,
      createdAt: new Date(),
      scheduledAt: new Date(),
    };
    jobQueue.enqueue(job);
  }
}

// Optional: start runner if this file is executed directly (node backend/workers/jobRunner.js)
if (require.main === module) {
  const runner = new JobRunner();
  runner.start();
}