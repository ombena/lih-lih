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