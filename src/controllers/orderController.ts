import { Request, Response } from 'express';
import { Server } from 'socket.io';
import prisma from '../prismaClient';

/**
 * Creates a new order with multiple items.
 * Generates OTP, calculates totals, and EMITS REAL-TIME ALARM to the store.
 */
export const createOrder = async (req: Request, res: Response) => {
  const { client_id, store_id, items, dropoff_lat, dropoff_lng } = req.body;

  try {
    const deliveryPin = Math.floor(1000 + Math.random() * 9000).toString();

    const itemIds = items.map((i: any) => i.item_id);
    const dbItems = await prisma.item.findMany({
      where: { id: { in: itemIds } }
    });

    let foodTotal = 0;
    const orderItemsData: any[] = [];
    
    // Validation Check for Stock and Availability
    for (const orderItem of items) {
      const product = dbItems.find(db => db.id === orderItem.item_id);
      if (!product) {
        return res.status(400).json({ error: `Item with ID ${orderItem.item_id} not found` });
      }
      
      if (!product.is_available) {
        return res.status(400).json({ error: `Item ${product.name} is currently unavailable` });
      }
      
      if (product.stock_count !== null && orderItem.quantity > product.stock_count) {
        return res.status(400).json({ error: `Out of Stock: Only ${product.stock_count} left for ${product.name}` });
      }
      
      const subtotal = Number(product.price) * orderItem.quantity;
      foodTotal += subtotal;

      orderItemsData.push({
        food_name: product.name,
        quantity: orderItem.quantity,
        unit_price: product.price,
        item_id: product.id // Need this for the deduction later
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          client_id,
          store_id,
          status: 'Pending',
          delivery_pin: deliveryPin,
          food_total: foodTotal,
          delivery_fee: 0, 
          dropoff_lat,
          dropoff_lng
        }
      });

      await tx.orderItem.createMany({
        data: orderItemsData.map((item: any) => ({
          order_id: newOrder.id,
          food_name: item.food_name,
          quantity: item.quantity,
          unit_price: item.unit_price
        }))
      });

      // Deduction and Auto-Hide Logic
      for (const orderItem of orderItemsData) {
        const product = dbItems.find(db => db.id === orderItem.item_id);
        if (product && product.stock_count !== null) {
          const updatedItem = await tx.item.update({
            where: { id: product.id },
            data: { stock_count: { decrement: orderItem.quantity } }
          });
          
          if (updatedItem.stock_count !== null && updatedItem.stock_count <= 0) {
            // Auto-flip availability
            await tx.item.update({
              where: { id: product.id },
              data: { is_available: false, stock_count: 0 }
            });
            // We will emit the WebSocket event outside the transaction
          }
        }
      }

      return newOrder;
    });

    // --- PHASE 4: REAL-TIME KITCHEN ALARM ---
    // Retrieve the socket.io instance we attached in index.ts
    const io: Server = req.app.get('io');

    // 2. Alert the Client Apps to hide the item instantly for items that hit zero
    for (const orderItem of orderItemsData) {
      const product = dbItems.find(db => db.id === orderItem.item_id);
      if (product && product.stock_count !== null) {
        if (product.stock_count - orderItem.quantity <= 0) {
          io.emit('item_out_of_stock', { store_id: store_id, item_id: product.id });
        }
      }
    }
    
    // Broadcast ONLY to the specific store's room
    io.to(`store_${store_id}`).emit('new_order', {
      message: '🚨 NOUVELLE COMMANDE!',
      order: {
        id: result.id,
        status: result.status,
        food_total: result.food_total,
        items: orderItemsData, // Sending the hydrated items so the tablet can display them
        timeElapsed: 0
      }
    });
    // ----------------------------------------

    res.status(201).json({ 
      message: 'Order created successfully. Store notified.', 
      order: result 
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

/**
 * PHASE 1: Store Accepts Order
 */
export const storeAcceptOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const order = await prisma.order.update({
      where: { id: parseInt(id as string) },
      data: { status: 'Preparing' }
    });

    // Notify Client
    const io: Server = req.app.get('io');
    io.to(`client_${order.client_id}`).emit('order_status_updated', {
      order_id: order.id,
      new_status: 'Preparing',
      updated_at: new Date()
    });

    res.json({ message: 'Order is now being prepared', order });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

/**
 * PHASE 2: Driver Accepts Order
 */
export const driverAcceptOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { driver_id } = req.body;

  try {
    const updatedOrder = await prisma.order.update({
      where: { 
        id: parseInt(id as string),
        driver_id: null,
        status: 'Preparing'
      },
      data: {
        driver_id: parseInt(driver_id),
        status: 'Accepted_by_Driver'
      }
    });

    // Notify Client
    const io: Server = req.app.get('io');
    io.to(`client_${updatedOrder.client_id}`).emit('order_status_updated', {
      order_id: updatedOrder.id,
      new_status: 'Accepted_by_Driver',
      updated_at: new Date()
    });

    res.json({ message: 'Order successfully assigned to you!', order: updatedOrder });
  } catch (error) {
    res.status(400).json({ error: 'This order is no longer available or was already taken.' });
  }
};

/**
 * PHASE 3: Driver Picked Up
 */
export const driverPickupOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { delivery_fee } = req.body;

  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id as string) }
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });

    const foodTotal = Number(order.food_total);
    const fee = Number(delivery_fee);

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id as string) },
      data: {
        delivery_fee: fee,
        grand_total: foodTotal + fee,
        status: 'Picked_Up'
      }
    });

    // Notify Client
    const io: Server = req.app.get('io');
    io.to(`client_${updatedOrder.client_id}`).emit('order_status_updated', {
      order_id: updatedOrder.id,
      new_status: 'Picked_Up',
      updated_at: new Date()
    });

    res.json({ message: 'Pickup confirmed. Final total updated.', order: updatedOrder });
  } catch (error) {
    res.status(500).json({ error: 'Failed to confirm pickup' });
  }
};

/**
 * PHASE 4: Delivery Confirmation (The OTP Handshake)
 * This is the final step that closes the transaction.
 * Updated: Per new business plan, no platform debt is charged to the driver.
 */
export const completeOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { pin } = req.body;

  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id as string) }
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });

    // 1. Verify the PIN (OTP)
    if (order.delivery_pin !== pin) {
      return res.status(400).json({ error: 'Invalid Delivery PIN. Handover not authorized.' });
    }

    // 2. Mark order as delivered
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id as string) },
      data: { status: 'Delivered' },
      include: { items: true }
    });

    // 3. Social Proof Aggregation (Atomic Increments)
    // Update Store total orders
    await prisma.store.update({
      where: { id: order.store_id },
      data: { total_orders_count: { increment: 1 } }
    });

    // Update individual Item sales counts (finding by name since OrderItem is decoupled)
    for (const item of updatedOrder.items) {
      const dbItem = await prisma.item.findFirst({
        where: { store_id: updatedOrder.store_id, name: item.food_name }
      });
      if (dbItem) {
        await prisma.item.update({
          where: { id: dbItem.id },
          data: { total_sold_count: { increment: item.quantity } }
        });
      }
    }

    // Notify Client
    const io: Server = req.app.get('io');
    io.to(`client_${updatedOrder.client_id}`).emit('order_status_updated', {
      order_id: updatedOrder.id,
      new_status: 'Delivered',
      updated_at: new Date()
    });

    res.json({ 
      message: '✅ Delivery Successful! Order marked as completed.', 
      order: updatedOrder 
    });

  } catch (error) {
    console.error('Error completing order:', error);
    res.status(500).json({ error: 'Failed to complete delivery' });
  }
};

/**
 * PHASE 5: "I am Arriving" Notification
 */
export const arrivingNotification = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id as string) },
      data: { status: 'Arriving' }
    });

    // Notify Client
    const io: Server = req.app.get('io');
    io.to(`client_${updatedOrder.client_id}`).emit('order_status_updated', {
      order_id: updatedOrder.id,
      new_status: 'Arriving',
      updated_at: new Date()
    });

    res.json({ message: 'Client has been notified that you are arriving.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send notification' });
  }
};

/**
 * Fetches order details
 */
export const getOrderDetails = async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log('HIT: getOrderDetails, id:', id);
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id as string) },
      include: {
        items: true,
        store: true,
        client: true,
        driver: true
      }
    });
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch order details" });
  }
};

/**
 * Phase 5.2: Mark Order as Ready
 * Called by the store when cooking is finished. Moves status to 'Waiting' for courier.
 */
export const markOrderReady = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id as string) },
      data: { status: 'Waiting' } // Changes the status in PostgreSQL
    });

    // Notify Client
    const io: Server = req.app.get('io');
    io.to(`client_${updatedOrder.client_id}`).emit('order_status_updated', {
      order_id: updatedOrder.id,
      new_status: 'Waiting',
      updated_at: new Date()
    });

    res.json({ message: 'Order is ready for pickup', order: updatedOrder });
  } catch (error) {
    console.error('Error marking order ready:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

/**
 * Fetches active orders for a client
 */
export const getActiveClientOrders = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const orders = await prisma.order.findMany({
      where: {
        client_id: parseInt(id as string),
        status: { notIn: ['Delivered', 'Cancelled'] } // Only show active journeys
      },
      include: { 
        items: true, 
        store: true, 
        driver: true 
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching active orders:', error);
    res.status(500).json({ error: 'Failed to fetch active orders' });
  }
};

/**
 * 5-Second Pulse
 * Ultra-lightweight query returning only the active waiting order counts per store.
 */
export const getPulse = async (req: Request, res: Response) => {
  console.log('HIT: getPulse');
  try {
    const pulseData = await prisma.order.groupBy({
      by: ['store_id'],
      where: {
        status: 'Waiting', // Ready to be picked up
        driver_id: null    // Not yet claimed
      },
      _count: {
        id: true
      }
    });

    // Fetch latest store directory version from SystemRegistry
    const registry = await prisma.systemRegistry.findUnique({
      where: { key: 'stores_directory' }
    });
    const directory_version = registry?.version || 0;

    const formattedPulse = pulseData.map(group => ({
      store_id: group.store_id,
      active_orders: group._count.id,
      is_surge: group._count.id >= 3
    }));

    res.json({
      pulse: formattedPulse,
      directory_version
    });
  } catch (error) {
    console.error('Error in getPulse:', error);
    res.status(500).json({ error: 'Failed to fetch pulse' });
  }
};