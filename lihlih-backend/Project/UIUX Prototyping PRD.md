# **Product Requirements Document (PRD): UI/UX Prototyping**

**Project:** Tripartite Food Delivery Platform (Algeria MVP)

**Focus:** User Interface (UI) and User Experience (UX) Flow

**Target Devices:** Android & iOS (Low to Mid-range devices), Web/Tablet for Stores.

**Design Tool Recommendation:** Figma

## **1\. Core UX Principles for the Algerian Market**

* **Language Support:** The interface must support French and Arabic ( local Darja ).  
* **Low-Friction Onboarding:** Users should be able to browse food *before* being forced to create an account. Account creation happens at checkout.  
* **High Contrast & Clarity:** Drivers will use the app outside in the bright Algerian sun. High contrast buttons and a dark mode are essential.  
* **Performance:** Avoid heavy animations. Keep the UI lightweight so it loads instantly on 3G networks.

## **2\. The Client App (Hungry User)**

**Goal:** Make finding food and ordering as fast as possible, while maintaining trust during the waiting period.

### **Key Screens & Views:**

1. **Home / Discovery Page**  
   * **Header:** Current pinned location (e.g., "El Bayadh Center").  
   * **Search Bar:** Search for specific food or store names.  
   * **Categories:** Quick circular icons (Pizza, Tacos, Burgers, Traditional).  
   * **Feed:** List of nearby open restaurants with thumbnails, rating, and estimated time.  
2. **Store Menu Page**  
   * Store header (Image, Name, Rating).  
   * Categorized list of items (e.g., "Sandwiches", "Boissons").  
   * Tap an item \-\> Opens a bottom sheet to add quantity or special notes (e.g., "Sans Harissa").  
3. **Cart & Checkout Page**  
   * List of selected items and the food\_total.  
   * **Location Picker:** A simple map interface to drop a static pin (no live tracking needed). Text field for "Additional instructions" (e.g., "Behind the blue door").  
   * **Payment Method:** Pre-selected to "Cash on Delivery (COD)".  
   * **Call to Action (CTA):** A large "Confirm Order" button.  
4. **Active Order / Timeline View (Crucial MVP Screen)**  
   * *Since there is no live map tracking, this screen manages the user's anxiety.*  
   * **Vertical Timeline:** \* \[x\] Order Placed  
     * \[x\] Food Preparing (Store accepted)  
     * \[ \] Picked up by \[Driver Name\] (Shows Motorcycle type & Plate)  
     * \[ \] Arriving Soon\!  
   * **The OTP Block:** A highly visible box displaying the 4-digit PIN (e.g., "Your Delivery PIN: 8492").  
   * **Final Total:** Displays the food\_total \+ delivery\_fee (which updates once the driver inputs it at the store).

## **3\. The Driver App (Freelance Delivery)**

**Goal:** Maximize efficiency, minimize distractions while driving, and enforce the financial security steps.

### **Key Screens & Views:**

1. **Dashboard / Home**  
   * Large toggle: **"Go Online" / "Go Offline"**.  
   * Today's Stats: Deliveries completed (Threshold tracker: e.g., "7/10 for Bonus"), Cash Collected, Platform Debt.  
2. **Available Orders (The Radar)**  
   * A list of nearby orders waiting for a driver.  
   * Each card shows: Store Name, Estimated Distance to Store, and a large "Accept Order" button.  
3. **Active Mission: Step 1 (Pickup)**  
   * Shows Store details and order list (to verify the food).  
   * **Action Button:** "Navigate to Store" (Deep links to Google Maps/Waze).  
   * **Crucial Step:** When tapping "I've picked up the food," a popup appears requiring the driver to input the **Delivery Fee** (e.g., typing in "250 DZD").  
4. **Active Mission: Step 2 (Dropoff)**  
   * Shows Client details (Name, Phone number button, Address notes).  
   * **Action Button:** "Navigate to Client" (Deep links to external map).  
   * **Action Button:** "I am Arriving" (Sends push notification to client).  
   * **Completion Step:** A number pad appears asking for the **Client's 4-digit PIN**. Once entered correctly, the order moves to "Completed".

## **4\. The Store Dashboard (Tablet / Web)**

**Goal:** Be loud, foolproof, and fast. Kitchen staff have wet/greasy hands and are in a rush.

### **Key Screens & Views:**

1. **Incoming Orders (The Alarm)**  
   * When an order arrives, the screen flashes, and an alarm sound loops until interacted with.  
   * Big green button: "Accept (15 mins)". Big red button: "Reject (Out of stock)".  
2. **Active Kitchen Board (Kanban Style)**  
   * Two columns: **"Preparing"** and **"Ready for Pickup"**.  
   * Each order is a card showing the Order ID, Driver assigned, and the list of items.  
   * Once food is cooked, staff taps "Mark as Ready," moving it to the next column and notifying the driver.  
3. **Store Settings & Earnings**  
   * Simple page showing today's revenue.  
   * Toggle to turn the store "Busy/Offline" if they are overwhelmed.  
   * Subscription status indicator (e.g., "Subscription active for 45 more days").

## **5\. Prototyping Flow Instructions for the Designer**

When building the interactive prototype in Figma, link the screens to demonstrate the following "Happy Path":

1. Client places order \-\> Store screen flashes.  
2. Store accepts order \-\> Driver sees it on the radar.  
3. Driver accepts \-\> Driver taps navigate to store.  
4. Driver inputs 200 DZD fee \-\> Client timeline updates with the final price.  
5. Driver arrives \-\> Asks for PIN \-\> Enters PIN \-\> Success screen on both apps.