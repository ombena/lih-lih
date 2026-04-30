Feature PRD: Orders Tracking Hub & Real-Time Sync

Project: LihLih Client App (React Native / Expo)
Module: Post-Checkout Experience & Socket.io Integration
Design System: Kinetic Oasis (Light Theme)

1. Executive Summary

This module transforms the OrdersScreenPlaceholder into the Active Orders Hub. Its primary goal is to manage customer expectations without using live map tracking. It achieves this by displaying a clear vertical timeline of the order's status and prominently featuring the 4-digit Delivery PIN (OTP) needed to complete the Cash on Delivery (COD) transaction.
To make the experience feel instantaneous, the app will connect to the backend's Socket.io server to receive live status updates (e.g., watching "Pending" automatically switch to "Preparing" without pulling to refresh).

2. Architecture & State Management

Data Fetching: TanStack Query (useQuery) to fetch the initial list of active orders when the screen loads.

Real-Time Engine: socket.io-client to maintain a persistent connection to the backend.

Cache Invalidation: When a socket event is received, we use React Query's queryClient.setQueryData or queryClient.invalidateQueries to instantly update the UI without an extra network request.

MVP Constraint: For this phase, we continue using the hardcoded CLIENT_ID = 1 to match the seeded database.

3. Backend Prerequisites (Node.js/Express)

Before the frontend can track orders, the backend needs two minor updates:

3.1. New REST Endpoint (Fetch Active Orders)

Route: GET /api/orders/client/:id/active

Controller Logic:

export const getActiveClientOrders = async (req: Request, res: Response) => {
const orders = await prisma.order.findMany({
where: {
client_id: parseInt(req.params.id),
status: { notIn: ['Delivered', 'Cancelled'] } // Only show active journeys
},
include: { items: true, store: true, driver: true },
orderBy: { created_at: 'desc' }
});
res.json(orders);
};

3.2. Socket.io Emitters (The Pulse)

In orderController.ts, every time an order changes status, the backend must emit an event to the specific client's room.

Socket Room: client\_${client_id}

Event Name: order_status_updated

Action Required: In storeAcceptOrder, markOrderReady, driverAcceptOrder, driverPickupOrder, and arrivingNotification, add the following:

const io: Server = req.app.get('io');
io.to(`client_${order.client_id}`).emit('order_status_updated', {
order_id: order.id,
new_status: 'Preparing', // or 'Waiting', 'Picked_Up', etc.
updated_at: new Date()
});

4. Frontend Implementation: Socket Service

Create a dedicated hook to manage the WebSocket connection so it can be used globally.

src/hooks/useOrderSocket.ts

import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { API_URL } from '../services/api'; // Extract base URL from api.ts

// Connect to the base URL (remove /api from the end)
const SOCKET_URL = API_URL.replace('/api', '');

export const useOrderSocket = (clientId: number) => {
const queryClient = useQueryClient();

useEffect(() => {
const socket: Socket = io(SOCKET_URL);

    socket.on('connect', () => {
      socket.emit('join_client_room', clientId);
      console.log(`🔌 Connected to socket & joined client_${clientId}`);
    });

    socket.on('order_status_updated', (data) => {
      console.log('🔄 Order Status Update Received:', data);

      // Instantly refresh the active orders list in the background
      queryClient.invalidateQueries({ queryKey: ['active_orders', clientId] });
    });

    return () => {
      socket.disconnect();
    };

}, [clientId, queryClient]);
};

(Note for backend dev: Ensure index.ts has socket.on('join*client_room', (clientId) => socket.join('client*' + clientId))).

5. Component Breakdown: OrdersScreen.tsx

This screen will map through the active orders and render a detailed tracking card for each.

5.1. The Screen Layout

Header: Standard text "Mes Commandes en Cours".

List: FlatList using RefreshControl (for manual overrides) pointing to the GET /api/orders/client/:id/active endpoint.

Empty State: A friendly graphic showing no active orders, with a KineticButton to navigate back to "Discovery".

5.2. ActiveOrderCard.tsx (Presentational Component)

This is the heart of the screen, heavily utilizing the UIPrimitives.tsx.

Header Row: Store Name & Order ID (e.g., O'Tacos - #8492).

Timeline Tracker: Re-use the existing OrderJourneyTimeline component from your Primitives. Map the backend status to the timeline steps.

The OTP Security Block (Crucial UX):

A beautifully styled, high-contrast block (using the primary gradient).

Text: "Code de Livraison (PIN)"

Display: The massive 4-digit delivery_pin fetched from the order data.

Disclaimer: "Donnez ce code au livreur uniquement lorsque vous recevez votre commande." (Give this code to the driver only when you receive your order).

Price Breakdown: Subtotal (Food) + Delivery Fee (if Picked_Up is true and fee is set, otherwise "Calculé par le livreur").

6. The User Workflow

Checkout: User swipes to checkout on the Cart screen.

Navigation: App automatically redirects to the OrdersScreen (via React Navigation).

Connection: useOrderSocket(1) connects to the server and joins client_1.

Initial Load: The screen fetches the newly created orders (Status: Pending).

The Magic Moment: The Store Dashboard manager taps "Accepter". The backend emits order_status_updated.

Real-Time Shift: The useOrderSocket hook hears the event, invalidates the query, and the OrderJourneyTimeline physically animates from "Order Placed" to "Food Preparing" right in front of the user's eyes, without them touching the screen.

7. Acceptance Criteria

[ ] Backend GET /api/orders/client/:id/active route is implemented.

[ ] Backend socket.io logic is updated to emit order*status_updated to the client*{id} room on all status changes.

[ ] Frontend socket.io-client package is installed and useOrderSocket hook is functioning.

[ ] OrdersScreen.tsx displays active orders fetched via TanStack Query.

[ ] The Delivery PIN (OTP) is massively highlighted on the active order card.

[ ] The OrderJourneyTimeline primitive accurately reflects the current status of the order.

[ ] When an order changes status on the backend, the client app UI updates automatically and instantly without a manual page refresh.
