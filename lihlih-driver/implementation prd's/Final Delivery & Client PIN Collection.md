Feature PRD: Final Delivery & Client PIN Collection

Project: LihLih Driver App & Backend
Feature: COD Handover, GSM Notification & Transaction Closure
Design System: Kinetic Oasis

1. Executive Summary

The "Client Handover" is the final step in the LihLih delivery lifecycle. Because the platform uses a 100% Cash on Delivery (COD) model, we rely on a Dual-OTP System to prevent fraud.
When the driver arrives at the client's door, they must collect the exact Grand Total (Food + Delivery Fee) in cash. To officially close the mission and unlock their app for the next order, the driver must input a unique 4-digit Delivery PIN that only the client possesses.

To keep the MVP lightweight and 100% reliable, we bypass complex background Push Notifications. The driver will use a direct GSM phone call to notify the client of their arrival.

2. Driver App UX (The Collector & Caller)

The driver is locked into the Dropoff phase of the ActiveMissionScreen.

2.1. The Trigger (The Phone Call)

When the driver arrives, they tap a prominent KineticButton labeled "Appeler le client" (Call Client) accompanied by a Phone icon.

Tech Logic: This uses React Native's native linking to open the OS dialer: Linking.openURL('tel:+213666112233').

2.2. The Handover Modal (DeliveryOTPInput.tsx)

After the call, the driver taps "Saisir le PIN Client" to open the custom instantaneous keypad.

Developer Note: Reuse the premium custom keypad logic built for OasisOTPInput, but remove the Delivery Fee input field. We only need the 4-digit PIN dots.

Header: "Validation Client"

Visual Context: Display the Grand Total at the top of the modal so the driver can double-check the cash they just received. (e.g., "À encaisser : 1450 DA").

Interaction: The driver types the 4-digit PIN provided by the client and hits "Valider".

3. Backend Logic & Validation (orderController.ts)

The backend is responsible for verifying the PIN, closing the order, and updating the store's social proof metrics. The Driver App triggers this via the OTP modal.

Endpoint: PATCH /api/orders/:id/complete

Body: { pin: "8492" }

Strict Transaction Logic:

export const completeOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { pin } = req.body;

  try {
    const completedOrder = await prisma.$transaction(async (tx) => {
      // 1. Verify the order exists and is currently in the dropoff phase
      const order = await tx.order.findUnique({ where: { id: parseInt(id) } });

      if (!order || !['Picked_Up', 'Arriving'].includes(order.status)) {
        throw new Error('INVALID_STATE');
      }

      // 2. Validate the Client's Delivery PIN
      if (order.delivery_pin !== pin) {
        throw new Error('INVALID_PIN');
      }

      // 3. Mark as Delivered
      const updated = await tx.order.update({
        where: { id: order.id },
        data: { status: 'Delivered' }
      });

      // 4. Increment the Store's Social Proof Counter
      await tx.store.update({
        where: { id: order.store_id },
        data: { total_orders_count: { increment: 1 } }
      });

      return updated;
    });

    // 5. Trigger WebSockets for live UI updates
    const io = req.app.get('io');
    
    // Tell the Client App the order is done (Triggers the 5-Star Review Modal!)
    io.to(`client_${completedOrder.client_id}`).emit('order_status_updated', { 
      order_id: completedOrder.id, new_status: 'Delivered' 
    });

    res.json(completedOrder);

  } catch (error: any) {
    if (error.message === 'INVALID_PIN') return res.status(400).json({ error: 'Code PIN incorrect. Veuillez vérifier avec le client.' });
    if (error.message === 'INVALID_STATE') return res.status(400).json({ error: 'Cette commande ne peut pas être finalisée.' });
    res.status(500).json({ error: 'Server error' });
  }
};


4. Acceptance Criteria (DoD)

[ ] Driver App features a prominent "Appeler le client" button that uses Linking.openURL('tel:...') to native phone dialer.

[ ] Driver App uses the dedicated, instantaneous numeric keypad modal to capture the 4-digit client PIN.

[ ] Backend PATCH /api/orders/:id/complete endpoint correctly validates the delivery_pin within a transaction.

[ ] Successful validation updates order status to Delivered and increments the store's total_orders_count.

[ ] Successful validation clears the driver's active mission state (useMissionStore), returning them to the Radar feed.