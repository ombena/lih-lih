import { Request, Response } from 'express';
import prisma from '../prismaClient';

/**
 * Fetches all stores from the database including their menu items.
 */
export const getAllStores = async (req: Request, res: Response) => {
  try {
    const stores = await prisma.store.findMany({
      include: {
        menu_items: true,
      },
    });
    res.json(stores);
  } catch (error) {
    console.error('Error in getAllStores:', error);
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
};

/**
 * Fetches a single store by its ID.
 */
export const getStoreById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const store = await prisma.store.findUnique({
      where: { id: parseInt(id as string) },
      include: { menu_items: true },
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    res.json(store);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch store' });
  }
};

/**
 * Fetches active orders for the Kanban board.
 * Includes items and driver details, ordered by oldest first.
 */
export const getActiveOrders = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const orders = await prisma.order.findMany({
      where: {
        store_id: parseInt(id as string),
        // We only want orders that are currently active in the kitchen
        status: { in: ['Preparing', 'Waiting', 'Accepted_by_Driver'] }
      },
      include: {
        items: true,
        driver: true
      },
      orderBy: { created_at: 'desc' } // Oldest tickets first
    });

    // Map backend statuses to match the Kanban columns
    const mappedOrders = orders.map(order => ({
      ...order,
      status: order.status === 'Accepted_by_Driver' ? 'Waiting' : order.status
    }));

    res.json(mappedOrders);
  } catch (error) {
    console.error('Error in getActiveOrders:', error);
    res.status(500).json({ error: 'Failed to fetch active orders' });
  }
};