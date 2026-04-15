import { Request, Response } from 'express';
import prisma from '../prismaClient';

/**
 * Creates a new order with multiple items.
 * Generates OTP and calculates totals on the server for security.
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
    const orderItemsData = items.map((orderItem: any) => {
      const product = dbItems.find(db => db.id === orderItem.item_id);
      if (!product) throw new Error(`Item with ID ${orderItem.item_id} not found`);
      
      const subtotal = Number(product.price) * orderItem.quantity;
      foodTotal += subtotal;

      return {
        food_name: product.name,
        quantity: orderItem.quantity,
        unit_price: product.price
      };
    });

    const result = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          client_id,
          store_id,
          status: "Pending",
          dropoff_lat,
          dropoff_lng,
          food_total: foodTotal,
          delivery_pin: deliveryPin,
          items: {
            create: orderItemsData
          }
        },
        include: {
          items: true
        }
      });
      return newOrder;
    });

    res.status(201).json({
      message: "Order placed successfully!",
      order: result
    });

  } catch (error: any) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message || 'Failed to place order' });
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
    // We removed the platform_debt update logic here as per the "zero-charge" plan.
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id as string) },
      data: { status: 'Delivered' }
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
    await prisma.order.update({
      where: { id: parseInt(id as string) },
      data: { status: 'Arriving' }
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