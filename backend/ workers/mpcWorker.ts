// backend/workers/mpcWorker.ts

import { jobQueue } from "./queue";
import {
  BaseJob,
  JobType,
  MPCSignJobPayload,
  MPCOrchestrator,
} from "./types";

const MPC_SIGN_TYPE: JobType = "MPC_SIGN";

export class MPCWorker {
  private isProcessing = false;

  constructor(private orchestrator: MPCOrchestrator) {}

  async processNext(): Promise<void> {
    if (this.isProcessing) return;

    this.isProcessing = true;
    try {
      const job = jobQueue.dequeue();
      if (!job || job.type !== MPC_SIGN_TYPE) {
        this.isProcessing = false;
        return;
      }

      await this.handleMpcJob(job as BaseJob<MPCSignJobPayload>);
    } finally {
      this.isProcessing = false;
    }
  }

  private async handleMpcJob(
    job: BaseJob<MPCSignJobPayload>
  ): Promise<void> {
    try {
      const result = await this.orchestrator.signWithMPC(
        job.payload
      );

      if (!result.success) {
        if (job.attempts < job.maxAttempts) {
          jobQueue.requeue(job, 5_000); // retry after 5s
        } else {
          // eslint-disable-next-line no-console
          console.error(
            "[MPCWorker] Job failed permanently",
            job.id,
            result.error
          );
        }
        return;
      }

      // eslint-disable-next-line no-console
      console.log(
        "[MPCWorker] MPC signature complete",
        job.id,
        result.signature
      );
    } catch (err) {
      if (job.attempts < job.maxAttempts) {
        jobQueue.requeue(job, 10_000);
      } else {
        // eslint-disable-next-line no-console
        console.error(
          "[MPCWorker] Unexpected error, dropping job",
          job.id,
          err
        );
      }
    }
  }
}