Product Requirements Document: LihLih Driver App

Project: LihLih Tripartite Food Delivery Platform
Module: Driver Application (React Native / Expo)
Target Market: Algeria (Laghouat MVP)
Design System: Kinetic Oasis (Dark Theme Variant - Optimized for outdoor sunlight visibility and battery saving)

1. Executive Summary

The LihLih Driver App is the engine of the "Zero-Charge" delivery network. Designed for freelance motorcycle and car couriers in Algeria, the app is 100% free to use. It abandons heavy, battery-draining map SDKs (like Google Maps) in favor of a lightweight "Kinetic Sonar" (Radar) to find orders, and uses Deep Linking to hand off turn-by-turn navigation to the driver's preferred external app (Google Maps, Waze, OsmAnd).
The core workflow is a strict State Machine enforcing Cash on Delivery (COD) security via a 4-digit PIN.

2. Global Architecture & State Machine

The app operates on a strict, lock-step state machine to prevent errors. A driver can only be in one of these states at any given time:

OFFLINE: Not receiving pings.

ONLINE_POOL: Viewing the Radar, looking for orders.

MISSION_PICKUP: Accepted an order; en route to the Store.

MISSION_DROPOFF: Picked up the food; en route to the Client.

Tech Stack:

Framework: React Native + Expo (Local Builds).

State Management: Zustand (for tracking the active mission state).

Data Fetching: TanStack Query (React Query) for REST endpoints.

Real-time: socket.io-client (Listening to new_order_in_pool events).

Location: expo-location (Periodic polling, no constant live-streaming).

3. Screen Breakdown & UI Requirements

Screen 1: Dashboard & Status Gate (The Hub)

Purpose: Allow the driver to go online and review their daily metrics.

Header: Driver Name, Avatar, and a massive KineticSwitch (Online / Offline).

Metrics Cards (SurfaceCard):

Earnings Today: The total delivery fees collected today (calculated locally since the platform takes 0%).

Completed Trips: Number of successful deliveries.

Action: Toggling "Online" requests GPS permissions, grabs the current location, and navigates to the Radar Screen.

Screen 2: The Kinetic Sonar (The Order Pool)

Purpose: Replace a heavy map with a fast, gamified abstract radar to find hot zones and available orders.

UI (Dark Mode): A central dot (The Driver) with concentric distance rings (1km, 2km, 3km).

Store Nodes: Nearby stores with Waiting orders appear as glowing dots (Nodes).

Red/Pulsing Node: High volume (Surge / Hot Zone).

Orange Node: Standard volume.

Interaction: Tapping a node opens a BottomSheetModal displaying:

Store Name & Distance (e.g., "O'Tacos - 1.2km").

Number of ready orders at that location.

Action: KineticButton -> "Accepter la course" (Accept Order).

Screen 3: Active Mission - Phase 1 (Pickup)

Purpose: Guide the driver to the restaurant and lock in the delivery fee.

View Lock: Once an order is accepted, the app is locked to this screen. No backing out.

UI Elements:

Store Name & Order ID (e.g., #8492).

List of items (to verify the bag contents).

Actions:

"Naviguer vers le Resto" (Navigate): Deep-links to external maps using geo:lat,lng.

"J'ai récupéré la commande" (Confirm Pickup): Opens a critical modal.

The Fee Modal (Crucial Business Logic): \* The app prompts: "Quel est le montant de la livraison ?" (What is the delivery fee?).

Driver enters the amount (e.g., 200 DA) via a numeric keypad.

Submit updates the database (delivery_fee and grand_total) and moves the state to Phase 2.

Screen 4: Active Mission - Phase 2 (Dropoff & OTP)

Purpose: Guide the driver to the client, trigger the arrival notification, and secure the cash handover.

UI Elements:

Client Name, Phone Number (Tap to call).

Delivery Address/Notes.

Financials: Prominently displays the Grand Total (Food + Fee) the driver must collect in cash.

Actions:

"Naviguer vers le Client": Deep-links to external maps.

"Je suis arrivé" (I am arriving): Tapping this fires an API call that triggers a push notification to the client's phone: "Le livreur est là !"

"Finaliser la livraison" (Complete): Opens the OTP Pad.

The OTP Pad (Crucial Security):

A massive 4-digit input screen. The driver asks the client for their PIN.

If correct, the app celebrates (Confetti/Success UI), marks the order Delivered, updates social proof counters, and returns the driver to the Radar (Screen 2).

4. The Driver Workflow (Step-by-Step)

Boot & Auth: Driver opens the app (Hardcoded DRIVER_ID = 1 for MVP).

Go Online: Driver toggles the switch to "Online". App fetches expo-location.

The Radar: Driver watches the Sonar. A node pulses red (O'Tacos has 3 orders waiting).

Acceptance: Driver taps the node and accepts Order #8492.

Backend: PATCH /api/orders/8492/driver-accept (Assigns driver_id).

Transit to Store: Driver taps "Naviguer", opens Google Maps, drives to O'Tacos.

Pickup & Pricing: Driver grabs the food, taps "Récupéré", and inputs 200 DA for the fee.

Backend: PATCH /api/orders/8492/pickup (Updates fee, triggers WebSocket to client).

Transit to Client: Driver drives to Hassi Bahbah. Taps "Je suis arrivé".

Backend: PATCH /api/orders/8492/arriving (Notifies client).

The Handover: Driver meets client, hands over food, collects cash (e.g., 1400 DA). Asks for PIN.

Completion: Driver types 8492 (OTP) into the app.

Backend: PATCH /api/orders/8492/complete (Validates PIN, marks Delivered, increments social proof counters).

Reset: Mission clears. App returns to the Kinetic Sonar to find the next order.

5. Required Backend Integration (API Contracts)

The Driver App relies on the following existing/new endpoints:

Queries (TanStack Query)

GET /api/orders/pool

Returns orders where status = 'Waiting' and driver_id = null.

GET /api/drivers/:id/active-mission

Checks on app boot if the driver closed the app during a delivery. Returns the active order if status IN ('Accepted_by_Driver', 'Picked_Up', 'Arriving').

Mutations (Actions)

PATCH /api/orders/:id/driver-accept

Body: { driver_id: 1 }

PATCH /api/orders/:id/pickup

Body: { delivery_fee: 200 }

PATCH /api/orders/:id/arriving

No body. Triggers status update.

PATCH /api/orders/:id/complete

Body: { pin: "1234" } -> Fails with 400 if PIN is incorrect.

WebSockets (Socket.io)

Listen: new_order_in_pool (Triggers a silent refetch of the Radar data).

6. Development Milestones

Phase 1: Project Init (npx create-expo-app lihlih-driver), UI Primitives, and Navigation setup.

Phase 2: The Kinetic Sonar (Implement SVG math, distance calculations, and dummy nodes).

Phase 3: Active Mission View (UI for Pickup and Dropoff phases).

Phase 4: API Wiring (Connect TanStack Query, Zustand, and Socket.io).

Phase 5: Native Integrations (Location fetching and external map deep-linking Linking.openURL('geo:lat,lng')).
