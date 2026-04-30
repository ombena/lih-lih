import { Request, Response } from 'express';
import prisma from '../prismaClient';

/**
 * PHASE 6: Post-Delivery Feedback Loop
 */

/**
 * Fetch orders that are delivered but haven't been reviewed yet.
 * Used to trigger the feedback modal on the client app.
 */
export const getUnreviewedOrders = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const orders = await prisma.order.findMany({
      where: {
        client_id: parseInt(id as string),
        status: 'Delivered',
        review: { is: null } // Only orders without a review
      },
      include: { store: true },
      orderBy: { created_at: 'desc' },
      take: 1 // Only prompt for the most recent one to avoid overwhelming
    });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching unreviewed orders:', error);
    res.status(500).json({ error: 'Failed to fetch unreviewed orders' });
  }
};

/**
 * Submit a 5-pillar review for an order.
 * Updates the store's average rating automatically.
 */
export const submitReview = async (req: Request, res: Response) => {
  const { 
    order_id, 
    store_id, 
    client_id, 
    rating_quality, 
    rating_accuracy, 
    rating_packaging, 
    rating_value, 
    rating_speed, 
    comment 
  } = req.body;

  try {
    // 1. Create the review
    const review = await prisma.review.create({
      data: {
        order_id,
        store_id,
        client_id,
        rating_quality,
        rating_accuracy,
        rating_packaging,
        rating_value,
        rating_speed,
        comment
      }
    });

    // 2. Atomic Increment Strategy (O(1) Performance)
    // We update the Store counters directly without scanning the whole Review table.
    const updatedStore = await prisma.store.update({
      where: { id: store_id },
      data: {
        review_count: { increment: 1 },
        sum_quality: { increment: rating_quality },
        sum_accuracy: { increment: rating_accuracy },
        sum_packaging: { increment: rating_packaging },
        sum_value: { increment: rating_value },
        sum_speed: { increment: rating_speed },
      }
    });

    // 3. Update the legacy 'rating' field for server-side sorting/listing
    // Logic: ((SumOfSums) / (Count * 5)) * 5 -> (SumOfSums / Count) / 5 * 5 -> SumOfSums / (Count * 5)
    // Actually simpler: (TotalScore / (count * 5)) * 5 -> TotalScore / count
    const totalScore = (
      updatedStore.sum_quality + 
      updatedStore.sum_accuracy + 
      updatedStore.sum_packaging + 
      updatedStore.sum_value + 
      updatedStore.sum_speed
    ) / 5;
    
    const newAverage = updatedStore.review_count > 0 
      ? totalScore / updatedStore.review_count 
      : 5.0;

    await prisma.store.update({
      where: { id: store_id },
      data: { rating: parseFloat(newAverage.toFixed(1)) }
    });

    res.status(201).json({ message: 'Merci pour votre avis !', review });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
};
