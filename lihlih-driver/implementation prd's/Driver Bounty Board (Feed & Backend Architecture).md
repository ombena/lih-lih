Feature PRD: Driver Bounty Board (Feed & Backend Architecture)

Project: LihLih Driver App & Backend
Feature: Available Orders Feed, Local-First Store Cache, & 5-Second Pulse
Status: Architecture Refinement Phase

1. Executive Summary

This document defines the highly scalable data flow for the Driver's "Bounty Board" (Available Orders Feed). To maximize server performance, minimize 4G data consumption, and ensure a lightning-fast UI, we are adopting a Thick Client / Thin Server (Local-First) architecture:

The Store Directory Cache: On app boot, the driver's phone downloads and caches the static directory of all stores (Name, Lat, Lng).

The 5-Second Pulse: The backend is stripped of all geospatial responsibilities. Every 5 seconds, it simply broadcasts an ultra-lightweight array of Store IDs and their current active order counts.

Edge Computing (The Phone): The driver's smartphone processor merges the live Pulse data with the local cache, calculates exact distances using GPS (Turf.js), applies the Range Slider, and sorts the list.

2. Phase 1: The Initialization (Store Directory Sync)

The mobile app must maintain a local copy of all stores to perform local distance math. We use a Delta-Sync approach to keep this updated without downloading the whole database every time.

Endpoint: GET /api/stores/directory?last_sync={TIMESTAMP}

Purpose: Downloads static store data to the phone's local storage (e.g., AsyncStorage ).

Architectural Rules:

The Payload: Returns an array of stores containing only static/semi-static fields: id, name, lat, lng, is_open.

The Timestamp Logic: * If last_sync is missing (first install), return all stores.

If last_sync is provided, return only the stores created or updated (e.g., changed is_open status) since that timestamp.

Frontend Action: The app saves this data locally and updates its internal last_sync timestamp for the next boot.

3. Phase 2: The 5-Second Pulse (Ultra-Lightweight Backend)

The 5-second polling loop no longer requires GPS coordinates or Bounding Box math. It simply counts waiting orders.

Endpoint: GET /api/orders/pulse

Purpose: Serves as a heartbeat, telling drivers exactly where the demand is right now.

Architectural Rules:

The Query: The backend queries the Order table for items where status = 'Waiting' and driver_id = null.

The Grouping: Group the results by store_id and count them.

The Payload: The response must be an incredibly small JSON array. No names, no coordinates, no client details.

[
  { "store_id": 42, "active_orders": 3, "is_surge": false },
  { "store_id": 9, "active_orders": 8, "is_surge": true }
]


Note: Because this query uses standard counting/grouping on indexed columns with no geospatial math, the server can handle tens of thousands of requests per second.

4. Phase 3: Frontend Logic & Edge Math (The Phone CPU)

Inside AvailableOrdersScreen.tsx, the frontend orchestrates the merging of local data with the live pulse.

4.1. State Management

The screen requires the following local states:

isOnline (boolean): Controls whether the feed updates.

maxRange (number): The controller set by the driver (Default 2 km, max 10 km).

localStoreDirectory: The cached array of stores.

4.2. The Polling Hook Architecture (useBountyBoard.ts)

The custom hook must execute the following workflow every 5 seconds:

Get Location: Fetch the driver's exact GPS using Location.getCurrentPositionAsync({ accuracy: Balanced }).

Fetch the Pulse: Send the GET /api/orders/pulse request.

The Edge Math (Data Merge & Calculation):

Loop through the returned pulse array.

For each active store_id, look up its lat and lng in the localStoreDirectory.

Use @turf/distance to calculate the exact distance from the driver to the store in kilometers.

The Visual Filter: Filter out any store where calculated_distance > maxRange (respecting the driver's UI slider) and sort the remaining list ascending by distance (closest first).

5. Potential Issues & Solutions (Discussion Points)

The Stale Cache Problem:

Risk: A new restaurant joins LihLih at 2:00 PM. A driver who booted their app at 8:00 AM doesn't have the new store in their local cache. When the 5-second Pulse says "Store #99 has 1 order", the app crashes trying to look up Store #99.

Solution: Silent Error Handling. If a store_id in the Pulse is missing from the local cache, the frontend safely ignores it for that 5-second cycle and triggers an immediate background call to GET /api/stores/directory?last_sync={TIMESTAMP} to patch the missing data.

Battery Drain (The 5s GPS Ping):

Risk: Pinging the GPS hardware every 5 seconds drains batteries.

Solution: We set Location.Accuracy.Balanced (accurate to ~100 meters). If isOnline is false, the loop completely suspends.

Ghost Orders (Remote Claiming & Race Conditions):

Risk: A driver sees an order on the radar, but before they arrive, another driver takes it. Or worse, a lazy driver claims it remotely from their couch and never shows up, leaving the food to get cold.

Solution: Physical PIN Lock (No Remote Claiming). Drivers do not click a button to claim an order on the feed. The app simply guides them to the store. To officially lock an order to themselves, the driver must physically arrive at the restaurant, ask the cashier for the order's unique PIN, and type it into their app. The 5-second sweep will then automatically purge this locked order from all other drivers' feeds.

6. Acceptance Criteria

[ ] Backend provides a GET /api/stores/directory endpoint supporting last_sync delta updates.

[ ] Backend provides a highly optimized GET /api/orders/pulse endpoint returning only store_id and order counts.

[ ] Frontend successfully caches the Store Directory locally (AsyncStorage/SQLite) on boot.

[ ] Frontend setInterval queries the Pulse endpoint every 5 seconds when isOnline is true.

[ ] Frontend safely merges the Pulse data with the Local Directory, ignoring or fetching missing store IDs.

[ ] Frontend uses @turf/turf to calculate the exact circular distance locally and filters out stores beyond the driver's selected UI slider.