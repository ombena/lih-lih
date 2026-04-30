Feature PRD: Populated Discovery Feed & Multi-Store Cart

Project: LihLih Client App (React Native / Expo)
Module: Discovery & Checkout Flow
Design System: Kinetic Oasis (Light Theme)

1. Executive Summary

This module brings the core value proposition of LihLih to life: a hyper-localized, frictionless ordering experience.
The Discovery Feed acts as a dynamic landing page that reads the user's local AsyncStorage preset to fetch only relevant stores. The Cart & Checkout leverages that same local preset to auto-fill the delivery data.
Unique Value: The cart supports an unrestricted Multi-Store architecture. Users can add items from different restaurants simultaneously. Upon checkout, the app seamlessly splits the cart into distinct orders routed to their respective stores.

2. Architecture & State Management (Best Practices)

To prevent bloated files and "prop drilling," we will strictly separate concerns:

Server State (Stores, Feed): Use TanStack Query (React Query) to handle fetching, caching, loading states, and pull-to-refresh logic.

Local Global State (Cart): Use Zustand (a lightweight, fast state manager).

Crucial Architecture: The Cart store must track the store_id and store_name on every single item added. There is no currentStoreId lock.

Local Device State (User Presets): Re-use the existing storageService.ts to read the default identity and GPS coordinates.

Business Logic: Abstracted entirely into Custom Hooks (useDiscoveryFeed, useMultiStoreCheckout).

3. Component Breakdown: Discovery Feed (DiscoveryScreen.tsx)

This screen orchestrates the view but contains minimal logic, delegating fetching to useDiscoveryFeed.

3.1. Presentational Components (Dumb Components)

LocationHeader.tsx:

Displays the wilaya and baladia from the local default preset.

Tapping it opens the Profile Modal to switch presets.

GlobalSearchBar.tsx:

An OasisInput with a magnifying glass icon. Updates a local searchQuery state.

CategoryList.tsx:

A horizontal FlatList of pill buttons (Tous, Pizza, Burgers, etc.).

StoreFeed.tsx:

A vertical FlatList. Handles the "Empty State" (if no stores exist) and "Loading State" (skeletons).

StoreCard.tsx:

Displays the store image, name, rating, and estimated time. Uses React.memo to prevent unnecessary re-renders.

3.2. Custom Hook: useDiscoveryFeed.ts

// Responsibility: Fetching and filtering data
export const useDiscoveryFeed = () => {
const { defaultPreset } = useClientStorage();
const [activeCategory, setActiveCategory] = useState('Tous');
const [searchQuery, setSearchQuery] = useState('');

const { data: stores, isLoading, refetch } = useQuery({
queryKey: ['stores', defaultPreset?.wilaya, defaultPreset?.baladia],
queryFn: () => fetchStoresByLocation(defaultPreset.wilaya, defaultPreset.baladia),
enabled: !!defaultPreset,
});

const filteredStores = useMemo(() => {
// ... filtering logic ...
}, [stores, activeCategory, searchQuery]);

return { filteredStores, isLoading, refetch, activeCategory, setActiveCategory, setSearchQuery };
}

4. Component Breakdown: The Multi-Store Cart (CartScreen.tsx)

This screen groups the unstructured Zustand items by restaurant to visually explain to the user that they are placing multiple orders at once.

4.1. Presentational Components

StoreOrderGroup.tsx:

A visual container (e.g., a SurfaceCard) representing one specific restaurant's portion of the cart.

Header displays the store_name.

Renders a CartItemList inside it and a specific subtotal for just this store.

CartItemList.tsx:

Displays items, quantities, and a swipe-to-delete action.

GlobalReceiptSummary.tsx:

Calculates the Grand Total of all food items across all stores.

Displays a disclaimer: "Note: This cart contains orders from multiple stores. Delivery fees will be calculated per store upon arrival."

DeliveryPresetCard.tsx:

Read-only card showing the user's selected destination (e.g., "📍 Maison - Hassi Bahbah").

SwipeToCheckoutButton.tsx:

"Swipe right to confirm all orders" slider to prevent accidental massive orders.

4.2. Custom Hook: useMultiStoreCheckout.ts

// Responsibility: Grouping the cart and batch-submitting orders
export const useMultiStoreCheckout = () => {
const cartItems = useCartStore(state => state.items);
const clearCart = useCartStore(state => state.clearCart);
const { defaultPreset, profile } = useClientStorage();

// Group items by store_id locally before submission
const groupedOrders = useMemo(() => {
return cartItems.reduce((acc, item) => {
if (!acc[item.store_id]) acc[item.store_id] = [];
acc[item.store_id].push(item);
return acc;
}, {} as Record<number, typeof cartItems>);
}, [cartItems]);

const submitAllOrders = async () => {
try {
// Create an array of Promises to submit all orders concurrently
const orderPromises = Object.entries(groupedOrders).map(([storeId, items]) => {
const payload = {
client_name: profile.name,
client_phone: profile.phone_number,
store_id: parseInt(storeId),
delivery_lat: defaultPreset.lat,
delivery_lng: defaultPreset.lng,
delivery_street: defaultPreset.street,
items: items.map(item => ({ id: item.id, qty: item.quantity }))
};
return api.post('/api/orders', payload);
});

      // Wait for all orders to successfully reach the backend
      await Promise.all(orderPromises);

      clearCart();
      // Route to Order Timeline Screen
    } catch (error) {
      // Handle partial failures (e.g., one store is offline)
    }

};

return { submitAllOrders, groupedOrders, isReady: cartItems.length > 0 && !!defaultPreset };
}

5. The User Workflow (The Unrestricted Path)

Boot: App reads AsyncStorage. Finds default preset ("Laghouat").

Discovery: App instantly requests /api/stores/feed?wilaya=Laghouat. The feed renders natively.

Multi-Store Selection: \* User taps "O'Tacos", adds 2 Tacos to the cart.

User goes back, taps "Pizzeria Roma", and adds a Pizza to the cart. No warnings are shown.

Cart View: User opens the Cart. They see two distinct UI blocks (StoreOrderGroups): One for O'Tacos, and one for Pizzeria Roma.

Checkout: User swipes the "Confirm" button once. The frontend silently maps through the groups and sends two separate POST requests to the backend.

Backend Routing: O'Tacos receives ticket #1. Pizzeria Roma receives ticket #2. Two different drivers can now accept these distinct missions.

6. Backend API Contracts (Node.js/Express)

GET /api/stores/feed

Query: ?wilaya=String&baladia=String

Response: Array of store objects (id, name, image_url, rating, prep_time).

POST /api/orders (Called multiple times by the frontend in a loop/Promise.all)

Body: Payload for a single store (Phone, Name, GPS, store_id, Items).

Response: 201 Created with order_id.

7. Acceptance Criteria

[ ] TanStack Query is implemented for caching and pull-to-refresh on the Discovery Feed.

[ ] The Zustand Cart State allows mixing items from an unlimited number of stores by tracking store_id and store_name on each item.

[ ] The Cart UI automatically maps over the items and visually groups them by Restaurant into separate StoreOrderGroup cards.

[ ] The Checkout hook (useMultiStoreCheckout) successfully maps the grouped cart and fires concurrent POST requests via Promise.all() to generate independent database records.

[ ] The Checkout screen successfully reads the local AsyncStorage identity to bypass manual form entry.

[ ] A swipe-to-confirm gesture is used for the final checkout action.
