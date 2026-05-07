import { Queue } from 'bullmq';
import redis from '../redisClient';

/**
 * Order Queue
 * Handles delayed jobs like auto-cancellation of abandoned orders.
 */
export const orderQueue = new Queue('order-queue', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: 1000,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  },
});
