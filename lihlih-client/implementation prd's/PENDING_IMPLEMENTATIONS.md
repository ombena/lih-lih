# Pending & Missing Implementations (Roadmap)

This document tracks the remaining features and optimizations required to bring LihLih to a production-ready state.

## 1. Client App (LihLih Client)

### Authentication & User Lifecycle
- [ ] **SMS OTP Login Flow**: Create `LoginScreen` and `OTPScreen`.
- [ ] **Auth Context**: Implement Global Auth State to replace hardcoded `CLIENT_ID`.
- [ ] **Profile Completion**: Enforce name and primary address setup after first login.

### Order Management
- [ ] **Order History**: Create a dedicated screen to list past orders with status "Delivered" or "Cancelled".
- [ ] **Re-order Feature**: Single-tap button to populate the cart from a past order.
- [ ] **Detailed Receipt**: View itemized breakdown and price for completed orders.

### Social Proof Enhancements
- [ ] **Item-Level Popularity**: Display `total_sold_count` on menu items in `StoreScreen` (e.g., "100+ vendus").
- [ ] **Top Rated Badges**: Visual indicator for stores with exceptionally high 5-pillar scores.

### Infrastructure & UX
- [ ] **Push Notifications**: Integrate Expo Notifications/Firebase for background status updates.
- [ ] **Driver Communication**: Add a "Call Driver" button in the `OrdersScreen` (using `Linking`).
- [ ] **Real-time Map**: (Post-MVP) Integrate MapView to show live driver location.

---

## 2. Driver App (LihLih Driver) - *Coming Soon*

### Core Workflow
- [ ] **Orders Pool**: Screen to list available "Preparing" orders in the vicinity.
- [ ] **Acceptance Logic**: Swipe-to-accept mechanism with distance calculation.
- [ ] **PIN Validation UI**: Input field for the 4-digit OTP provided by the client.
- [ ] **Earnings Dashboard**: Track daily/weekly delivery totals.

### Geolocation
- [ ] **Background Tracking**: Send GPS coordinates to the server every 30 seconds during an active delivery.
- [ ] **Navigation Integration**: Quick link to open Google Maps/Waze with the destination address.

---

## 3. Backend & Operations

### Security
- [ ] **JWT Authorization**: Protect all `/api` routes using tokens instead of raw IDs.
- [ ] **Rate Limiting**: Prevent abuse of the OTP and Order creation endpoints.

### Scalability
- [ ] **Image Optimization**: Integrate a CDN or S3 storage for store and menu item photos.
- [ ] **Analytics**: Dashboard for platform admins to track volume and rating trends.

---

## 4. Design & Polish (Siyagha/Kinetic System)
- [ ] **Success Animations**: Add Lottie animations for order placement and review submission.
- [ ] **Skeleton Loaders**: Replace `ActivityIndicator` with modern skeleton screens for a premium feel.
