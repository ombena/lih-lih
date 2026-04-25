Feature PRD: Advanced Menu & Stock Management (Finite vs. Infinite)

Project: LihLih Store Dashboard
Feature: Menu Item Creation & Auto-Deducting Inventory
Design System: Kinetic Oasis

1. Executive Summary

Currently, the Store Dashboard only allows manually toggling items on or off. This feature introduces the ability for restaurant managers to create new menu items and track Finite vs. Infinite inventory.

Infinite Items (e.g., Tacos, Burgers): The kitchen cooks these until they manually toggle them off.

Finite Items (e.g., Cans of Soda, Bottled Water): The manager inputs a specific quantity (e.g., 50). The backend automatically deducts this number with every order and auto-hides the item when stock reaches zero.

2. Phase 1: Database Updates (schema.prisma)

The Item model needs to be updated to support categorization and stock counting.

Required Changes:

Add a category field to organize the menu (e.g., "Tacos", "Boissons").

Add an optional stock_count field.

Updated Prisma Model:

model Item {
  id           Int      @id @default(autoincrement())
  store_id     Int
  name         String
  description  String?
  price        Decimal
  category     String   @default("Général") // NEW: For grouping on the UI
  stock_count  Int?     // NEW: If null = Infinite. If integer = Finite stock.
  is_available Boolean  @default(true)
  
  store        Store    @relation(fields: [store_id], references: [id])
}


Developer Note: Run npx prisma migrate dev after updating the schema.

3. Phase 2: Frontend Architecture (React / Vite)

To keep the MenuManager.jsx view clean and optimized for "Rush Hour" toggling, the complex creation form must be isolated in a slide-up modal.

3.1. Main View Updates (MenuManager.jsx)

Add Item Button: Place a prominent KineticButton at the top of the screen: "+ Ajouter un article".

Display Stock: For items that have a stock_count, display a small badge next to the toggle showing the remaining amount (e.g., <StatusBadge text="Reste: 12" color="orange" />).

3.2. The Creation Modal (ItemEditorModal.jsx)

When the "+ Ajouter un article" button is clicked, a BottomSheetModal slides up.

Form Fields:

OasisInput: Name of the item.

OasisInput: Category (Text input or dropdown).

OasisInput: Price (Numeric).

The Stock Toggle Logic:

Implement a switch: "Suivre la quantité exacte ?" (Track exact quantity?).

State = Off (Infinite): Submits stock_count: null.

State = On (Finite): Reveals a number input field (e.g., "Nombre d'articles en stock"). Submits stock_count: [number].

4. Phase 3: Backend Logic & Auto-Deduction (Node.js/Express)

The backend must intercept orders and deduct from the finite inventory to prevent overselling.

4.1. Order Placement Logic (createOrder controller)

When a POST /api/orders request hits the server:

Validation Check: Iterate through the requested items. If an item has a stock_count !== null, verify that requested_quantity <= stock_count. If not, return a 400 Bad Request: Out of Stock error to the client app.

Deduction: If valid, proceed with order creation and decrement the stock_count in the database.

4.2. The "Auto-Hide" Trigger

After decrementing the stock, the backend must check if the item has hit zero.

// Pseudo-logic for the backend deduction
const updatedItem = await prisma.item.update({
  where: { id: item.id },
  data: { stock_count: { decrement: orderItem.quantity } }
});

if (updatedItem.stock_count !== null && updatedItem.stock_count <= 0) {
  // 1. Auto-flip availability to prevent further orders
  await prisma.item.update({
    where: { id: item.id },
    data: { is_available: false, stock_count: 0 }
  });
  
  // 2. Alert the Client Apps to hide the item instantly
  io.emit('item_out_of_stock', { store_id: item.store_id, item_id: item.id });
}


5. Acceptance Criteria (Definition of Done)

[ ] Developer has updated schema.prisma and successfully migrated the database.

[ ] The Store Dashboard has an "+ Ajouter un article" button that opens a clean bottom sheet modal.

[ ] A Store Manager can successfully create an infinite item (e.g., Burger).

[ ] A Store Manager can successfully create a finite item (e.g., 5 Cokes).

[ ] When 5 Cokes are ordered via the API, the backend successfully deducts the stock to 0, sets is_available to false, and emits a WebSocket event.