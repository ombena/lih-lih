import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
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
 * Fetches stores for the Discovery Feed based on wilaya and baladia.
 * Filters for open stores only.
 */
export const getDiscoveryFeed = async (req: Request, res: Response) => {
  const { wilaya, baladia } = req.query;

  try {
    const stores = await prisma.store.findMany({
      where: {
        wilaya: wilaya as string,
        baladia: baladia as string,
        is_open: true, // Only show open stores in the feed
      },
        select: {
          id: true,
          name: true,
          image_url: true,
          rating: true,
          prep_time: true,
          tags: true,
          review_count: true,
          total_orders_count: true,
          sum_quality: true,
          sum_accuracy: true,
          sum_packaging: true,
          sum_value: true,
          sum_speed: true,
        }
      });

    res.json(stores);
  } catch (error) {
    console.error('Error in getDiscoveryFeed:', error);
    res.status(500).json({ error: 'Failed to fetch discovery feed' });
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
      include: { 
        menu_items: true,
        reviews: {
          take: 10,
          orderBy: { created_at: 'desc' },
          include: {
            client: {
              select: { name: true }
            }
          }
        },
        // We get total_orders_count automatically since we didn't specify select
      },
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

/**
 * Store Rejects Order
 * Status moves to 'Cancelled'. Reason is captured for the client.
 */
export const storeRejectOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason, unavailableItems } = req.body; // Extract the specific missing items

  try {
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id as string) },
      data: { status: 'Cancelled' }
    });

    // TODO (Future Client App Phase): 
    // Here, you will use Socket.io to emit an 'order_rejected_action_required' event 
    // specifically to the client's room (e.g., io.to(`client_${updatedOrder.client_id}`).emit(...))
    // passing along the `unavailableItems` array so their phone pops up the re-order prompt.

    res.json({ 
      message: 'Order cancelled. Client will be prompted to re-order.', 
      reason,
      unavailableItems 
    });
  } catch (error) {
    console.error('Error rejecting order:', error);
    res.status(500).json({ error: 'Failed to reject order' });
  }
};

/**
 * Creates a new menu item for a store.
 */
export const createMenuItem = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, category, price, stock_count } = req.body;

  if (price === undefined || price === null || Number(price) <= 0) {
    return res.status(400).json({ error: 'Le prix doit être supérieur à 0' });
  }

  try {
    const newItem = await prisma.item.create({
      data: {
        store_id: parseInt(id as string),
        name,
        category: category || "Général",
        price,
        stock_count: stock_count !== undefined ? stock_count : null,
        is_available: stock_count === 0 ? false : true,
      }
    });

    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
};

/**
 * Toggles a menu item's availability.
 */
export const toggleItemAvailability = async (req: Request, res: Response) => {
  const { item_id } = req.params;

  try {
    const item = await prisma.item.findUnique({
      where: { id: parseInt(item_id as string) }
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const updatedItem = await prisma.item.update({
      where: { id: parseInt(item_id as string) },
      data: { is_available: !item.is_available }
    });

    res.json(updatedItem);
  } catch (error) {
    console.error('Error toggling item availability:', error);
    res.status(500).json({ error: 'Failed to toggle availability' });
  }
};

/**
 * Updates an existing menu item.
 */
export const updateMenuItem = async (req: Request, res: Response) => {
  const { item_id } = req.params;
  const { name, category, price, stock_count } = req.body;

  if (price === undefined || price === null || Number(price) <= 0) {
    return res.status(400).json({ error: 'Le prix doit être supérieur à 0' });
  }

  try {
    const item = await prisma.item.findUnique({
      where: { id: parseInt(item_id as string) }
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const updatedItem = await prisma.item.update({
      where: { id: parseInt(item_id as string) },
      data: {
        name,
        category: category || "Général",
        price,
        stock_count: stock_count !== undefined ? stock_count : null,
        // Optional logic: if stock was updated to > 0, we can automatically make it available again.
        is_available: stock_count === 0 ? false : (stock_count !== null && item.stock_count === 0 && stock_count > 0 ? true : item.is_available),
      }
    });

    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
};

/**
 * Updates the store profile details
 */
export const updateStoreProfile = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, phone_number, wilaya, baladia, street, lat, lng, tags, image_url, rating, prep_time } = req.body;

  try {
    const updatedStore = await prisma.store.update({
      where: { id: parseInt(id as string) },
      data: {
        name,
        phone_number,
        wilaya,
        baladia,
        street,
        lat: lat !== undefined && lat !== null ? new Prisma.Decimal(lat) : undefined,
        lng: lng !== undefined && lng !== null ? new Prisma.Decimal(lng) : undefined,
        tags: tags !== undefined ? tags : undefined,
        image_url: image_url !== undefined ? image_url : undefined,
        rating: rating !== undefined ? Number(rating) : undefined,
        prep_time: prep_time !== undefined ? prep_time : undefined,
      }
    });

    res.json(updatedStore);
  } catch (error) {
    console.error('Error updating store profile:', error);
    res.status(500).json({ error: 'Failed to update store profile' });
  }
};

/**
 * Toggles the store status with a Profile Guard
 */
export const toggleStoreStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { is_open } = req.body;

  try {
    const store = await prisma.store.findUnique({ where: { id: parseInt(id as string) } });
    if (!store) return res.status(404).json({ error: 'Store not found' });

    if (is_open) {
      if (!store.lat || !store.lng || !store.phone_number) {
        return res.status(400).json({
          error: "Profile incomplete",
          message: "Veuillez configurer votre position GPS et vos coordonnées avant d'ouvrir la boutique."
        });
      }
    }

    const updatedStore = await prisma.store.update({
      where: { id: parseInt(id as string) },
      data: { is_open }
    });

    res.json(updatedStore);
  } catch (error) {
    console.error('Error toggling store status:', error);
    res.status(500).json({ error: 'Failed to toggle store status' });
  }
};