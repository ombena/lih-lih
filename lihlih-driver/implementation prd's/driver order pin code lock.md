Feature Update: Store Navigation & Selective PIN Claiming

Project: LihLih Driver App
Target Component: StoreOrderSheet.tsx & Backend orderController.ts
Goal: Add external map navigation to the store, and allow drivers to selectively claim individual orders from a store using unique PIN codes, rather than batch-claiming the entire store.

1. Executive Summary

The workflow inside the StoreOrderSheet is being refined to give drivers more control.

Navigation: Drivers need a prominent button at the top of the sheet to instantly launch Google Maps/Waze with the store's exact coordinates.

Selective Claiming: Instead of a single master button to claim all orders at a store, each individual order in the list will have its own "Saisir le PIN" (Enter PIN) button. This allows a driver to take 4 orders that are close together and leave the 5th order (which might be far away) in the pool for another driver.

2. UI/UX Changes: StoreOrderSheet.tsx

2.1. The "Drive to Store" Button

At the top of the Bottom Sheet, right beneath the Store Name and Distance, add a new primary action button.

Component: KineticButton (or similar).

Label: "Naviguer vers le restaurant" (Navigate to Store).

Icon: A Map/Navigation icon.

Logic: Use React Native's Linking API to open the native map application.

import { Linking, Platform } from 'react-native';

const navigateToStore = (lat: number, lng: number, storeName: string) => {
const scheme = Platform.select({ ios: 'maps://0,0?q=', android: 'geo:0,0?q=' });
const latLng = `${lat},${lng}`;
const label = encodeURIComponent(storeName);
const url = Platform.select({
ios: `${scheme}${label}@${latLng}`,
android: `${scheme}${latLng}(${label})`
});

if (url) Linking.openURL(url);
};

2.2. Per-Order PIN Buttons

Inside the FlatList or ScrollView of orders:

Remove the single master "Enter PIN" button at the bottom of the sheet.

Add a smaller KineticButton or a styled action area to the bottom of each order card.

Label: "Accepter (Saisir PIN)"

Interaction: Tapping this button opens the OasisOTPInput modal, specifically passing that order.id into the modal's state.

2.3. Post-Claim Visual State

When the driver successfully enters the PIN for an order:

The order card is instantly removed from the store's un-claimed orders list in the StoreOrderSheet.

The order is moved to the driver's active mission list ("Mon Sac" / My Bag) in a separate tab.

The driver remains in the sheet so they can claim more orders if they want to. If no orders remain in the list, the sheet can display an empty state or automatically close.

3. Backend Logic Update: Order-Specific Claiming

The previous backend logic found "the oldest order" for a store. This must be updated so the driver claims a specific order using its ID and PIN.

Endpoint: PATCH /api/orders/:order_id/claim

Body: { "driver_id": 1, "pin_code": "1234" }

The Strict SQL Transaction Sequence (orderController.ts):

export const claimSpecificOrder = async (req: Request, res: Response) => {
const { order_id } = req.params;
const { driver_id, pin_code } = req.body;

try {
const claimedOrder = await prisma.$transaction(async (tx) => {
// 1. Guard: Check driver capacity (Max 5 active missions)
const activeCount = await tx.order.count({
where: {
driver_id: parseInt(driver_id),
status: { in: ['Accepted_by_Driver', 'Picked_Up', 'Arriving'] }
}
});
if (activeCount >= 5) throw new Error('MAX_MISSIONS_REACHED');

      // 2. Lock & Verify the specific order
      const order = await tx.order.findUnique({
        where: { id: parseInt(order_id) }
      });

      if (!order || order.status !== 'Waiting' || order.driver_id !== null) {
        throw new Error('ORDER_UNAVAILABLE');
      }

      if (order.pickup_pin !== pin_code) {
        throw new Error('INVALID_PIN');
      }

      // 3. Assign to driver
      return await tx.order.update({
        where: { id: parseInt(order_id) },
        data: {
          driver_id: parseInt(driver_id),
          status: 'Accepted_by_Driver'
        }
      });
    });

    // 4. Trigger WebSockets to clear this specific order from other drivers' screens
    req.app.get('io').emit('radar_refresh_needed');

    res.json(claimedOrder);

} catch (error: any) {
if (error.message === 'MAX_MISSIONS_REACHED') return res.status(403).json({ error: 'Sac plein (Max 5)!' });
if (error.message === 'ORDER_UNAVAILABLE') return res.status(404).json({ error: 'Trop tard, commande déjà prise.' });
if (error.message === 'INVALID_PIN') return res.status(400).json({ error: 'Code PIN incorrect.' });
res.status(500).json({ error: 'Server error' });
}
};

4. Developer Acceptance Criteria (DoD)

[ ] A "Navigate to Store" button exists at the top of the StoreOrderSheet and successfully launches the native OS map application with coordinates.

[ ] Each order card in the sheet has its own individual button to trigger the PIN modal.

[ ] The PIN modal captures the PIN and sends it to the updated PATCH /api/orders/:order_id/claim endpoint.

[ ] The Backend safely validates the PIN against that specific order ID inside a Database Transaction.

[ ] A successfully claimed order is removed from the StoreOrderSheet UI and instantly appears in the driver's active missions tab ("Mon Sac").
