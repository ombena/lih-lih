import { Worker, Job } from 'bullmq';
import redis from '../redisClient';
import prisma from '../prismaClient';

/**
 * Order Worker
 * Processes background jobs for orders.
 */
const orderWorker = new Worker(
  'order-queue',
  async (job: Job) => {
    const { orderId } = job.data;

    console.log(`🔍 Checking status for Order #${orderId} (Job: ${job.id})`);

    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        console.warn(`⚠️ Order #${orderId} not found. Skipping.`);
        return;
      }

      // If the order is still Pending or Preparing after the delay, it's considered abandoned
      // or stuck (e.g., store went offline or driver never showed up)
      if (order.status === 'Pending' || order.status === 'Preparing') {
        console.log(`🚫 Auto-cancelling abandoned Order #${orderId} (Current Status: ${order.status})`);
        
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'Cancelled' },
        });

        // TODO: Emit socket event to notify client and store
      } else {
        console.log(`✅ Order #${orderId} is active or finished (${order.status}). No action needed.`);
      }
    } catch (error) {
      console.error(`❌ Error in Order Worker for Order #${orderId}:`, error);
      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 5, // Handle up to 5 checks simultaneously
  }
);

orderWorker.on('completed', (job) => {
  console.log(`✨ Job ${job.id} completed successfully`);
});

orderWorker.on('failed', (job, err) => {
  console.error(`💥 Job ${job?.id} failed with error: ${err.message}`);
});

export default orderWorker;
