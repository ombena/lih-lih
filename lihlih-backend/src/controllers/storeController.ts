import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../prismaClient';
import redis from '../redisClient';


/**
 * Increments the version for a specific key in the SystemRegistry.
 */
export const incrementSystemVersion = async (key: string) => {
  try {
    await prisma.systemRegistry.upsert({
      where: { key },
      update: { version: { increment: 1 } },
      create: { key, version: 1 }
    });
  } catch (error) {
    console.error(`Failed to increment system version for ${key}:`, error);
  }
};

/**
 * Returns the current version of the stores directory.
 */
export const getStoreVersion = async (req: Request, res: Response) => {
  try {
    const registry = await prisma.systemRegistry.findUnique({
      where: { key: 'stores_directory' }
    });
    res.json({ version: registry ? registry.version : 0 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch directory version' });
  }
};

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
  const { available_only } = req.query;

  try {
    const whereClause: any = {
      store_id: parseInt(id as string),
      status: { in: ['Preparing', 'Waiting', 'Accepted_by_Driver'] }
    };

    // If driver app asks for available orders, exclude those already assigned
    const isAvailableOnly = available_only === 'true' || available_only === '1';
    
    if (isAvailableOnly) {
      whereClause.status = 'Waiting';
      whereClause.driver_id = null;
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
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
  console.log(`DEBUG: updateStoreProfile called for Store ID: ${id}`);
  const { name, phone_number, wilaya, baladia, street, lat, lng, tags, image_url, rating } = req.body;

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
        updated_at: new Date(), // Explicitly force update for Checksum Sync
      }
    });

    console.log(`HEURE ENREGISTRÉE : ${updatedStore.updated_at}`);
    
    // Increment global store directory version
    await incrementSystemVersion('stores_directory');
    
    // ⚡ Invalidate Redis Cache
    await redis.del('system:stores_directory');
    
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
      data: { 
        is_open,
        updated_at: new Date() 
      }
    });

    // Increment global store directory version
    await incrementSystemVersion('stores_directory');

    // ⚡ Invalidate Redis Cache
    await redis.del('system:stores_directory');

    res.json(updatedStore);
  } catch (error) {
    console.error('Error toggling store status:', error);
    res.status(500).json({ error: 'Failed to toggle store status' });
  }
};


/**
 * Fetches the static store directory for local caching by the driver app.
 * Returns only essential fields (id, name, lat, lng, image_url, etc).
 * Implementation: Cache-Aside pattern with Redis.
 */
export const getStoreDirectory = async (req: Request, res: Response) => {
  const CACHE_KEY = 'system:stores_directory';

  try {
    // 1. Try Cache First
    const cachedData = await redis.get(CACHE_KEY);
    if (cachedData) {
      console.log('⚡ Serving Store Directory from Redis Cache');
      return res.json(JSON.parse(cachedData));
    }

    // 2. Fetch from DB
    console.log('🔄 Cache Miss - Fetching Store Directory from Database');
    const stores = await prisma.store.findMany({
      select: {
        id: true,
        name: true,
        lat: true,
        lng: true,
        image_url: true,
        wilaya: true,
        baladia: true,
        tags: true,
      }
    });

    // 3. Save to Cache (1 hour TTL is enough for directory sync)
    await redis.set(CACHE_KEY, JSON.stringify(stores), 'EX', 3600);

    res.json(stores);
  } catch (error) {
    console.error('Error in getStoreDirectory:', error);
    res.status(500).json({ error: 'Failed to fetch store directory' });
  }
};

/**
 * Hydrates a list of store IDs with real-time dynamic data.
 */
export const hydrateStores = async (req: Request, res: Response) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ error: "Invalid IDs provided" });
  }

  console.log(`DEBUG [hydrateStores] Hydrating ${ids.length} stores: ${ids.join(', ')}`);

  try {
    const stores = await prisma.store.findMany({
      where: {
        id: { in: ids.map((id: any) => parseInt(id)) },
        is_open: true // Only return open stores for the discovery feed
      }
    });
    console.log(`DEBUG [hydrateStores] Found ${stores.length} open stores.`);
    res.json(stores);
  } catch (error) {
    console.error("Hydration Error:", error);
    res.status(500).json({ error: "Failed to hydrate stores" });
  }
};