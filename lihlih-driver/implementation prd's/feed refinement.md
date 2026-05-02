Feature Update: Driver Feed Refinements, GPS Toggle & Distance Slider

Project: LihLih Driver App
Target Screen: AvailableOrdersScreen.tsx & useBountyBoard.ts
Goal: Fix offline polling bugs, introduce a manual GPS toggle to save battery, add missing offline UI states, and implement the missing distance filtering slider.

1. Missing Feature: The Distance Slider (Range Controller)

Observation: The developer missed the implementation of the distance slider, which is crucial for the "Edge Computing" architecture where the phone filters the feed locally.
Required Change: Add a draggable slider to let the driver control their search radius (1km to 10km).

UI Implementation: \* Add a slider component (e.g., KineticSlider) directly below the header/GPS toggle area.

Provide visual markers for the minimum (1km) and maximum (10km) values.

Display the currently selected value dynamically (e.g., "Rayon: 3.5 KM").

Logic Update (useBountyBoard.ts): \* The selected slider value (maxRangeKm) must be passed into the hook.

Before returning processedStores, filter the array locally: stores.filter(store => store.distance <= maxRangeKm).

Moving the slider should instantly hide/show stores without triggering a new API call.

2. Bug Fix: The Offline State Guard

Observation: When the driver toggles their Master Status to "Offline," the interval loop continues to count down and fetch data.
Required Change: The polling interval must strictly respect the isOnline master state.

Logic Update: Inside useBountyBoard.ts, if isOnline becomes false:

Instantly clear the setInterval.

Wipe the processedStores array (set to []).

Reset the countdown timer.

3. New UI: The Offline Empty State

Observation: When offline, the screen needs to clearly communicate why the feed is empty rather than just showing a blank screen.
Required Change: Replace the empty feed with a dedicated "Offline" visual state.

UI Components:

Icon/Graphic: A prominent, sleepy/offline icon (e.g., a massive Moon or WifiOff icon) colored in outline/muted gray (#abadae).

Title: "Vous êtes hors ligne" (You are offline).

Subtitle: "Passez en ligne pour recevoir les commandes disponibles autour de vous." (Go online to receive available orders).

Behavior: This state only renders when the Master Online/Offline toggle is set to false.

4. New Feature: The GPS "Pulse" Toggle & Interval

Observation: Drivers shouldn't be forced to use live GPS constantly if they are just browsing available zones from home.
Required Change: Introduce a "Live GPS" toggle to let the driver switch between real-time tracking and a static profile location, and optimize the network interval.

4.1. UI Implementation

Add a secondary, smaller toggle button (or a styled MapPin icon button) inside the AvailableOrdersScreen header area.

Label/Tooltip: "GPS en direct" (Live GPS).

4.2. Polling Interval Update

Change: Increase the overall polling interval from 5 seconds to 10 seconds. This applies regardless of which location mode is active, reducing server load by 50%.

4.3. Location Logic Routing (useBountyBoard.ts)

The hook must now accept a new boolean: isGpsPulseActive.

If isGpsPulseActive === true (Live Mode):

Fire Location.getCurrentPositionAsync() every 10 seconds.

Use these fresh coordinates to calculate the distances to stores via Turf.js.

If isGpsPulseActive === false (Static Mode):

Do not ping the device's GPS hardware.

Retrieve the driver's default saved coordinates from local storage (or their profile preset, exactly like the Client App's manual location feature).

Use these static coordinates to calculate the distances via Turf.js every 10 seconds.

5. Developer Acceptance Criteria (DoD)

[ ] A draggable distance slider is present, allowing radius selection between 1km and 10km.

[ ] Changing the slider instantly filters the visible stores locally without an API call.

[ ] Changing master status to "Offline" immediately stops the 10-second timer and wipes the feed data.

[ ] A clear, branded "Offline" graphic/message is displayed when isOnline is false.

[ ] The global pulse interval is updated from 5s to 10s.

[ ] A new "Live GPS" toggle is present on the AvailableOrdersScreen.

[ ] When "Live GPS" is ON, the app fetches hardware coordinates every 10s.

[ ] When "Live GPS" is OFF, the app reads the driver's static profile location and calculates distances from that static point, saving battery.
