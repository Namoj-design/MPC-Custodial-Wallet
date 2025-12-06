// backend/workers/queue.ts

import { BaseJob } from "./types";

export class JobQueue {
  private queue: BaseJob[] = [];

  enqueue(job: BaseJob): void {
    this.queue.push(job);
  }

  dequeue(): BaseJob | undefined {
    const now = new Date();
    const index = this.queue.findIndex(
      (job) => job.scheduledAt <= now
    );

    if (index === -1) {
      return undefined;
    }

    const [job] = this.queue.splice(index, 1);
    return job;
  }

  size(): number {
    return this.queue.length;
  }

  requeue(job: BaseJob, delayMs: number): void {
    job.attempts += 1;
    job.scheduledAt = new Date(Date.now() + delayMs);
    this.enqueue(job);
  }
}

// Singleton instance for the process
export const jobQueue = new JobQueue();