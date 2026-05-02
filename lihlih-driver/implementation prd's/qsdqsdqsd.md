Feature PRD: Store Arrival Lock (Pickup PIN)

Project: LihLih Platform (Driver App, Store App, Backend)
Feature: Anti-Ghost Claiming / Physical Presence Verification
Design System: Kinetic Oasis

1. Executive Summary

To prevent drivers from claiming orders remotely ("Ghost Claiming") and leaving food cold on the counter, we are implementing a Store Arrival Lock using a 4-digit Pickup PIN.
When a driver sees a "Hot Zone" on their Radar, they must physically drive to the restaurant, walk up to the cashier, and ask for the order's PIN. Typing this PIN into the Driver App is the only way to claim the order and add it to their "Mission Bag" (which will support up to 5 orders).

2. Phase 1: Database Updates (schema.prisma)

We need a new column on the Order table to store this specific lock code. It must be separate from the delivery_pin (which is used at the client's door).

Required Change:

model Order {
// ... existing fields

pickup_pin String // NEW: The 4-digit code the store gives to the driver
delivery_pin String // EXISTING: The 4-digit code the client gives to the driver

// ... existing relations
}

Developer Note: Update POST /api/orders to generate a random 4-digit string (e.g., Math.floor(1000 + Math.random() \* 9000).toString()) and save it to pickup_pin when the client creates the order.

3. Phase 2: Backend Logic (orderController.ts)

We must replace the old claimNextStoreOrder function with a new, highly secure endpoint that requires the PIN.

Endpoint: PATCH /api/orders/claim-by-pin

Body: { store_id: 1, driver_id: 1, pickup_pin: "7721" }

Logic (Transaction):

export const claimOrderByPin = async (req: Request, res: Response) => {
const { store_id, driver_id, pickup_pin } = req.body;

try {
const claimedOrder = await prisma.$transaction(async (tx) => {
// 1. Guard for Multi-Mission (Max 5 active orders per driver)
const activeMissionsCount = await tx.order.count({
where: {
driver_id: parseInt(driver_id),
status: { in: ['Accepted_by_Driver', 'Picked_Up', 'Arriving'] }
}
});

      if (activeMissionsCount >= 5) {
        throw new Error('MAX_MISSIONS_REACHED');
      }

      // 2. Find the specific Waiting order using the PIN
      const order = await tx.order.findFirst({
        where: {
          store_id: parseInt(store_id),
          pickup_pin: pickup_pin,
          status: 'Waiting',
          driver_id: null
        }
      });

      if (!order) {
        throw new Error('INVALID_PIN');
      }

      // 3. Lock it in for this driver!
      const updated = await tx.order.update({
        where: { id: order.id },
        data: {
          driver_id: parseInt(driver_id),
          status: 'Accepted_by_Driver'
        },
        include: { store: true, client: true, items: true }
      });

      return updated;
    });

    // 4. WebSockets: Inform the Store and the Client
    const io = req.app.get('io');
    io.to(`store_${store_id}`).emit('driver_assigned', { order: claimedOrder });
    io.to(`client_${claimedOrder.client_id}`).emit('order_status_updated', {
      order_id: claimedOrder.id, new_status: 'Accepted_by_Driver'
    });
    io.emit('radar_update_needed');

    res.json(claimedOrder);

} catch (error: any) {
if (error.message === 'MAX_MISSIONS_REACHED') return res.status(403).json({ error: 'Sac plein ! (Max 5 commandes)' });
if (error.message === 'INVALID_PIN') return res.status(400).json({ error: 'Code PIN incorrect ou commande déjà prise.' });
res.status(500).json({ error: 'Server error' });
}
};

4. Phase 3: Store Dashboard UI (OrderCard.jsx)

The kitchen staff needs to easily see this PIN so they can shout it out to the driver who walks through the door.

Target State: The PIN should only be heavily emphasized when the order status is Waiting (En attente du coursier).

UI Update: Inside OrderCard.jsx, add a prominent visual block for the pickup_pin.

{/_ Render this inside OrderCard when status is 'Waiting' _/}
{!isPreparing && (

  <div className="bg-[#eff1f2] rounded-2xl p-4 mt-4 border-2 border-dashed border-[#abadae] flex justify-between items-center">
    <span className="text-xs font-black text-[#595c5d] uppercase tracking-widest">Code Chauffeur :</span>
    <span className="text-3xl font-black tracking-[0.2em] text-[#ae2900]">{order.pickup_pin}</span>
  </div>
)}

5. Phase 4: Driver App UI (lihlih-driver)

The workflow on the Driver Radar completely changes to enforce physical presence.

Step 1: The Radar Bottom Sheet

When the driver taps "O'Tacos" on the radar, they see the number of active orders.

Button Change: Instead of "Accepter la course", the button says "Saisir le Code PIN (Au comptoir)".

Step 2: The OTP Pad Modal

Tapping the button opens a massive numeric keypad (reusing OasisOTPInput).

Header: "Demandez le code au caissier" (Ask the cashier for the code).

Action: The driver types 7721.

Network: The app calls PATCH /api/orders/claim-by-pin.

Step 3: Success & Multi-Mission Routing

Success Toast: "Commande #8492 ajoutée à votre sac !"

Routing Rule: The driver is NOT locked out of the radar. They return to the Radar view, allowing them to type another PIN if the cashier has a second order ready, up to a maximum of 5 orders.

The "My Bag" Tab: A floating button or bottom tab shows 🎒 Mon Sac (1/5). They click this to view their itinerary and start delivering when they are ready.

6. Acceptance Criteria (DoD)

[ ] schema.prisma contains pickup_pin and is successfully migrated.

[ ] The order creation endpoint generates a random 4-digit pickup_pin.

[ ] Backend strictly validates pickup_pin before updating driver_id.

[ ] Backend enforces the 5-mission maximum limit per driver.

[ ] Store App displays the pickup_pin massively on the Kanban board when an order is marked as Waiting.

[ ] Driver App requires a 4-digit PIN input from the Radar screen to claim an order.

[ ] Successfully typing the PIN leaves the driver on the Radar screen to allow stacking additional orders (up to 5).
