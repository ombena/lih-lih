# Architectural Update: Local Distance Math & Radius Filtering (Client App)

**Project:** LihLih Client App
**Feature:** Edge Computing Distance Filter (Discovery Feed)
**Goal:** Use the smartphone's processor to calculate distances and filter out restaurants that are too far away (e.g., > 5km) without relying on the server.

## 1. The UX Rule: No GPS Walls

**Constraint:** The app must NEVER block the user from seeing the feed just because their hardware GPS is turned off.
**Solution:** The distance calculation must rely entirely on the coordinates of the user's **Active Delivery Address** (e.g., "Maison - Cité 5 Juillet" -> Lat: 34.6, Lng: 3.2).

## 2. Frontend Logic (The Local Math Engine)

Inside the Client App's `DiscoveryFeed` screen, the app will execute the following logic using `@turf/turf` every time the local Wilaya cache is loaded or the user changes their delivery address.

### Step-by-Step Execution:

1. **Load Cache:** Retrieve the Wilaya-scoped store directory from `AsyncStorage`.
2. **Get Target:** Retrieve the `lat` and `lng` of the user's currently selected delivery address.
3. **The Edge Math:** Loop through the cached stores. Use Turf.js to calculate the exact circular distance between the Delivery Address and each Store. Append this `calculated_distance` to the store object.
4. **The Hard Filter (e.g., 5 km):** Filter the array to strictly keep stores where `calculated_distance <= 5.0`.
5. **The Soft Sort:** Sort the remaining valid stores. (e.g., Sponsored stores first, then closest stores, then highest rated).

## 3. Handling "Out of Range" Edge Cases

**Observation:** If a user in Djelfa searches for a specific famous restaurant, but they live 7km away from it, hiding it completely might make them think the app is broken or the restaurant isn't on LihLih.

**UI Recommendation (The "Too Far" Section):**
Instead of completely deleting stores beyond 5km from the array, segment them.

- **Primary Feed:** Stores <= 5km (Fully colorful, clickable, ready to order).
- **Bottom Section (Optional):** A small list at the very bottom of the feed titled "Hors zone de livraison" (Out of delivery zone). These stores are visible but visually dimmed/grayed out. If the user clicks them, a toast message explains: _"Cette boutique est trop loin de votre adresse de livraison actuelle."_ (This store is too far from your current delivery address).

## 4. Developer Acceptance Criteria (DoD)

- [ ] Distance calculations are performed entirely on the client's device using Turf.js.
- [ ] The reference point for the math is the active Delivery Address, NOT a forced hardware GPS ping.
- [ ] Stores with a distance greater than the defined maximum radius (e.g., 5km) are either removed from the primary feed or moved to a distinct "Out of Range" visual state.
- [ ] Changing the delivery address in the top header instantly recalculates the distances and re-renders the feed without making a single API call to the server.
