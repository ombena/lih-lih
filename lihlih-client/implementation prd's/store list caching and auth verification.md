Feature PRD: Edge-First Boot Sequence & Auth Sync

Project: LihLih Client App
Feature: Splash Screen Loading Flow, Local Cache Sync, & Edge Math
Goal: Create a 0-latency Discovery Feed by caching the store directory locally, validating versions during the Splash screen, and utilizing the smartphone's CPU to filter stores by distance.

1. Executive Summary

When the user opens the LihLih app, the Splash Screen must act as a Command Center. Before the user ever sees the main feed, the Splash Screen must sequentially execute three tasks in the background:

Identity Verification: Confirm the user's phone number/token against the database.

Directory Sync: Check the global "Store List Version" and download a new list if the local cache is outdated.

Edge Geometry: Calculate the distance from the user's delivery address to all cached stores and filter out those beyond the delivery range (e.g., 10km).

2. The Boot Sequence (Step-by-Step Flow)

Phase 1: Identity & Authentication Check

While the LihLih logo is pulsating on the screen, the app checks who is holding the phone.

Action: Retrieve the stored auth_token or phone_number from AsyncStorage.

API Call: GET /api/auth/me

Logic: \* If the API returns 200 OK (User exists and is verified), proceed to Phase 2.

If the API returns 401/404 (Token expired, or phone number banned/deleted), redirect the user immediately to the LoginScreen to re-enter their phone number.

Phase 2: The Store Directory Sync (Version Control)

Once identity is confirmed, the app checks if its local restaurant list is up to date.

Action: Retrieve local_directory_version from AsyncStorage (e.g., Version: 42).

API Call: GET /api/stores/version

Response: { "current_version": 43 }

Logic:

Match (43 === 43): Do nothing. Load the store list directly from AsyncStorage.

Mismatch (42 !== 43): Call GET /api/stores/directory. Download the fresh JSON array of all stores. Overwrite the AsyncStorage cache and update the local_directory_version to 43.

Phase 3: Edge Computing (Local Distance Math)

Now the app has a verified user and an up-to-date local list of stores. The server's job is done. The phone's CPU takes over.

Action: Retrieve the user's currently selected Delivery Address coordinates (Lat/Lng).

The Math: Pass the cached store list through a local @turf/turf distance function.

import { distance, point } from '@turf/turf';

// 1. Get user location
const userLocation = point([userLng, userLat]);

// 2. Map and Calculate
const processedStores = cachedStores.map(store => {
const storeLocation = point([store.lng, store.lat]);
const distanceKm = distance(userLocation, storeLocation, { units: 'kilometers' });
return { ...store, distanceKm };
});

// 3. Filter (The Range Guard)
const MAX_RANGE_KM = 10;
const availableStores = processedStores.filter(store => store.distanceKm <= MAX_RANGE_KM);

// 4. Sort (Closest first)
const sortedFeed = availableStores.sort((a, b) => a.distanceKm - b.distanceKm);

Phase 4: Transition to UI

Hide the Splash Screen.

Render the DiscoveryFeedScreen, passing in the sortedFeed array. Because this happened in memory, the UI renders instantly with zero loading spinners.

3. Backend Requirements (storeController.ts)

To support this, the Backend needs two ultra-fast, lightweight endpoints.

GET /api/stores/version

Purpose: Returns a single integer. The database should maintain a global store_directory_version that increments by +1 every time an Admin adds a store, or a store changes its open/close status.

GET /api/stores/directory

Purpose: Returns the complete array of active stores with their basic info (ID, Name, Image, Lat, Lng, Status). Do not include full menus here, just the directory data needed for the feed.

4. Edge Cases to Handle

No Internet Connection on Boot: \* If the API calls in Phase 1 or 2 fail due to a network error, do not crash the app. Bypass the version check, load the existing cache from AsyncStorage, calculate the distances, and show a small toast: "Mode hors ligne. En attente de réseau." (Offline mode. Waiting for network).

Location Not Set:

If the user is a brand new account and hasn't set a Delivery Address yet, skip Phase 3. Hide the splash screen and immediately show the AddressSelectionModal before rendering the feed.

5. Acceptance Criteria (DoD)

[ ] Splash screen remains visible until the Auth and Sync phases are complete.

[ ] Backend GET /api/auth/me successfully validates the stored session/phone.

[ ] App successfully compares local version vs. server version and only downloads the directory if a mismatch occurs.

[ ] CPU successfully calculates @turf/distance for all cached stores against the selected delivery address.

[ ] The final UI feed strictly excludes any store with a calculated distance greater than the defined max range.
