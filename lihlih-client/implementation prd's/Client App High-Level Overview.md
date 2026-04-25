LihLih Client App: High-Level Overview

Platform: React Native (Expo) targeting Android & iOS
Design System: Kinetic Oasis
Core Business Logic: 100% Cash on Delivery (COD), Zero-Charge Driver Model

1. Purpose & Vision

The LihLih Client App is the customer-facing storefront of our tripartite delivery platform. Its primary purpose is to convert hungry users into successful orders with the absolute minimum amount of friction.

Because we are targeting regions like Laghouat, the app must respect local habits:

Connectivity: Optimized for 3G/4G connections (lightweight images, no heavy live-map rendering).

Payment: Purely Cash on Delivery (COD). No credit card integrations to slow down the checkout process.

Localization: UI designed to support French , using relatable, high-contrast visual cues.

2. The Core Philosophy: "Browse First, Authenticate Last"

Unlike many global apps that force users to create an account before seeing the food, LihLih uses a deferred registration model.

Users can open the app, browse restaurants, look at menus, and build their cart completely anonymously.

The app only asks for their Phone Number and GPS Location at the exact moment they tap "Confirm Order". This drastically reduces the bounce rate.

3. Key Features & The User Journey

A. The Discovery Feed (Home)

Static Location Pinning: At the top, the app shows the general area (e.g., "Hassi Bahbah Centre").

Category Pills: Quick horizontal scrolling icons for Pizza, Tacos, Burgers, Plats Traditionnels.

Store Cards: High-quality image, store name, star rating, and estimated preparation time.

B. The Kinetic Menu

Categorized Lists: Restaurants' menus are displayed with clear prices and descriptions.

Bottom Sheet Customization: When a user taps "Tacos Poulet", a modal slides up from the bottom allowing them to add quantities or type specific instructions (e.g., "Sans sauce algérienne").

C. The Frictionless Checkout

Dynamic Pricing: The cart shows the food_total. The delivery_fee is clearly marked as "Calculated by courier at pickup" to manage expectations.

One-Tap Location: A simple button grabs their HTML5/Native GPS coordinates and attaches them to the order.

D. The "Anxiety-Free" Timeline (Crucial MVP Feature)

Because we are using a FOSS architecture without expensive live-tracking maps (no little moving motorcycle), we must manage the user's wait time through a beautiful UI.

Vertical Progress Bar: A visual step-by-step track:

Order Placed

Food Preparing (Triggered by the Store Dashboard)

Picked Up (Triggered by the Driver App)

Arriving! (Push Notification)

The OTP & Dual-Confirmation System (Crucial): Because the delivery fee is set dynamically by the driver based on fixed city zones (200 to 1000 DZD), we use a dual-input system for complete financial transparency. When the driver picks up the order at the store, they input the exact delivery fee they will charge. Upon arrival at the client's location, the client must use their app to input the total amount they were charged alongside a 4-digit PIN (One Time Password) to close the transaction. This guarantees the handover happened and lets the admin know exactly how much cash the driver collected.

Rating System: Clients rate stores and drivers (1 to 5 stars)

4. UI/UX Directives (Kinetic Oasis)

The Client App will strictly follow the Kinetic Oasis design language:

No Spinners: We will use the sweeping ProgressBlade gradient at the top of the screen during API calls.

Tonal Depth: Heavy use of surface, surface-container-low, and deep drop shadows to separate cards, rather than 1px solid borders.

Vibrant Actions: Primary buttons (like "Checkout") will use the striking #ae2900 to #ff7855 gradient to draw the eye.
