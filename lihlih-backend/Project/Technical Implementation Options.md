# **Technical Implementation: Notifications & Location (Lean MVP Approach \- 100% FOSS)**

To keep development costs strictly at zero, ensure complete data sovereignty, and maintain a lightweight architecture, this implementation avoids all proprietary services (like Firebase or Google Maps APIs). Instead, it relies on static coordinate capture, open-source push notification servers, and universal deep-linking to external navigation apps.

## **1\. Notification System Options (100% FOSS)**

Because we are not transmitting live GPS data every second, our notification needs are simpler, but they must remain independent of Big Tech servers.

### **A. Self-Hosted Push Notifications (ntfy.sh or Gotify) \- *For Clients & Drivers***

* **Use Case:** Used to tell the client "Your order is ready" or "The driver is outside." Also used to tell the driver "New order available near you."  
* **Why it fits:** By hosting an open-source push server like **ntfy** or **Gotify** on your Octenium VPS, you bypass Google's Firebase completely.  
* **The Technical Mechanism:** The mobile apps maintain a lightweight background WebSocket connection to your VPS to listen for these alerts. This gives you 100% control over your notification data without any proprietary vendor lock-in.

### **B. WebSockets (Socket.io) \- *Strictly for the Store***

* **Use Case:** The only place you truly need real-time data is the Store Dashboard.  
* **Why it fits:** Socket.io is an open-source (MIT License) real-time engine. When a client orders, the store's tablet needs to ring loudly and instantly, like a phone call. WebSockets keep a live connection open just for the restaurants to ensure they never miss an order.

## **2\. Location & Navigation (The "External Map" Strategy)**

Instead of paying for expensive map routing APIs inside your app, you will leverage the free apps already installed on the driver's phone, prioritizing open-source options where possible.

### **A. Capturing the Client's Location**

* The exact moment the client taps "Checkout", your app asks for location permission and grabs their current Latitude and Longitude *once* using the device's native GPS.  
* This static GPS pin is saved to your PostgreSQL database alongside their order.

### **B. The Driver's Navigation (Universal Deep Linking)**

* The driver does **not** need to copy and paste text.  
* When the driver accepts an order, your app shows a button: **"Navigate to Store"** (and later **"Navigate to Client"**).  
* **How it works technically:** Your app uses the universal geo:latitude,longitude URI scheme. When the driver taps the button, the phone asks which app they want to use. This seamlessly integrates with 100% FOSS offline maps like **OsmAnd** or **Organic Maps**, or any other default navigation app the driver prefers.  
* **Advantage:** 100% Free for you, completely open standards, and drivers get to use the navigation app they are most comfortable with.

## **3\. How Order Tracking Works (Status-Based vs. Live)**

Since the client won't see a little motorcycle moving on a map, you must manage their expectations using a clear **Timeline UI** with manual driver triggers.

### **The Client Timeline:**

1. **Order Placed** (Time stamped)  
2. **Food Preparing** (Triggered when Store accepts)  
3. **Picked Up** (Triggered when Driver taps "I have the food")  
4. **Driver is Arriving\!** (Crucial step)

### **The "Arriving" Trigger:**

Since there is no live map, the driver needs a way to tell the client to come downstairs.

* Add a button on the Driver's app: **"I am 2 minutes away."**  
* When the driver is getting close (or when they pull into the neighborhood), they tap this button.  
* This triggers your backend to send an immediate push notification via your self-hosted **ntfy/Gotify** server to the client: *"Your driver is arriving\! Please prepare your PIN and cash."*

## **4\. Driver Dispatch (The "Pull" vs "Push" System)**

Instead of the server constantly tracking all drivers to find who is closest (which requires heavy server processing), let the drivers "Pull" the orders.

* **The Mechanism:** The driver opens your app and taps "Go Online" or "Refresh Orders".  
* **The Location Capture:** At that exact moment, the app grabs the driver's current GPS coordinates and sends them to your server via a secure API request.  
* **The Match:** The server quickly calculates the distance between the driver's pin and all waiting orders at the restaurants using standard mathematical formulas in your backend. It returns a list of available orders within a defined radius (e.g., 3 kilometers).  
* **Advantage:** You only process location data when the driver actively asks for it, saving massive amounts of server power on your VPS and keeping the entire dispatch algorithm within your own open-source backend code.