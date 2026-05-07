# **Product Requirements Document (PRD): Database Architecture**

**Project:** Localized Food Delivery MVP **Target Market:** Algeria (Starting local, e.g., Laghouat) **Architecture Type:** Lean MVP (Relational SQL Database \- PostgreSQL / MySQL)

## **1\. Objective**

To design a lightweight, highly scalable relational database that supports a tripartite delivery system (Client, Store, Driver). The database must handle static geolocation data, driver-inputted dynamic pricing, OTP-secured transaction states, and offline subscription tracking, minimizing heavy server load.

## **2\. Entity Summaries & Table Structures**

### **2.1. clients Table**

**Purpose:** Stores the end-user (hungry person) details. Built for speed so clients don't have to re-enter their location or phone number every time they order.

* **client\_id** (INT, Primary Key): Unique identifier.  
* **name** (VARCHAR): Client's display name.  
* **phone\_number** (VARCHAR, Unique): Used for login/authentication and for the driver to call.  
* **default\_lat** (DECIMAL): Stored latitude to speed up future checkouts.  
* **default\_lng** (DECIMAL): Stored longitude to speed up future checkouts.  
* **created\_at** (TIMESTAMP): Account creation date.

### **2.2. stores Table**

**Purpose:** Manages the fast-food restaurants. Contains their static GPS coordinates for driver navigation and tracks their flat-rate subscription status.

* **store\_id** (INT, Primary Key): Unique identifier.  
* **name** (VARCHAR): Restaurant name.  
* **phone\_number** (VARCHAR): Contact number.  
* **lat** (DECIMAL): Static store latitude (used for deep-linking to driver's map app).  
* **lng** (DECIMAL): Static store longitude (used for deep-linking to driver's map app).  
* **sub\_valid\_until** (DATETIME): The expiration date of their 3-month subscription. If NOW() \> sub\_valid\_until, the store is automatically hidden from the client app.

### **2.3. drivers Table**

**Purpose:** Manages the freelance delivery fleet, their vehicle details for security, and their financial relationship with the platform.

* **driver\_id** (INT, Primary Key): Unique identifier.  
* **name** (VARCHAR): Driver's full name.  
* **phone\_number** (VARCHAR, Unique): Used for login and client contact.  
* **plate\_number** (VARCHAR): Motorcycle license plate for security tracking.  
* **platform\_debt** (DECIMAL): A running tally of the platform fees owed by the driver from Cash on Delivery (COD) transactions.

### **2.4. orders Table**

**Purpose:** The central nervous system of the app. It tracks the lifecycle of a transaction, holds the generated OTP for security, and locks in the final financials once the driver inputs the zone fee.

* **order\_id** (INT, Primary Key): Unique order identifier.  
* **client\_id** (INT, Foreign Key): The user who ordered.  
* **store\_id** (INT, Foreign Key): The restaurant preparing the food.  
* **driver\_id** (INT, Foreign Key): The assigned driver (Null until a driver accepts).  
* **status** (ENUM): 'Pending', 'Preparing', 'Accepted\_by\_Driver', 'Picked\_Up', 'Arriving', 'Delivered', 'Cancelled'.  
* **dropoff\_lat** (DECIMAL): Captured exactly when the client checks out.  
* **dropoff\_lng** (DECIMAL): Captured exactly when the client checks out.  
* **food\_total** (DECIMAL): Sum cost of the food items.  
* **delivery\_fee** (DECIMAL): Inputted dynamically by the driver upon store pickup (e.g., 200, 300 DZD).  
* **grand\_total** (DECIMAL): food\_total \+ delivery\_fee.  
* **delivery\_pin** (VARCHAR(4)): Secure 4-digit OTP generated at checkout.

### **2.5. order\_items Table**

**Purpose:** Acts as the digital receipt detailing exactly what food items are inside a specific order.

* **item\_id** (INT, Primary Key): Unique item row identifier.  
* **order\_id** (INT, Foreign Key): Links the item to the main order.  
* **food\_name** (VARCHAR): Name of the item (e.g., "Tacos Poulet").  
* **quantity** (INT): How many of this item.  
* **unit\_price** (DECIMAL): Price per item at the exact time of order.

## **3\. Entity Relationships (Table Relations)**

The database relies on standard One-to-Many (1:N) relationships, with the orders table acting as the central junction.

1. **Clients to Orders (1:N)**  
   * **Relation:** One Client can have Many Orders.  
   * **Logic:** clients.client\_id maps to orders.client\_id. This allows users to view their past order history.  
2. **Stores to Orders (1:N)**  
   * **Relation:** One Store can process Many Orders.  
   * **Logic:** stores.store\_id maps to orders.store\_id. This populates the store's dashboard with incoming tickets.  
3. **Drivers to Orders (1:N)**  
   * **Relation:** One Driver can deliver Many Orders.  
   * **Logic:** drivers.driver\_id maps to orders.driver\_id. This builds the driver's daily earning history and is used to calculate if they have hit their daily threshold (e.g., \>10 deliveries/day).  
4. **Orders to Order Items (1:N)**  
   * **Relation:** One Order contains Many Order Items.  
   * **Logic:** orders.order\_id maps to order\_items.order\_id. This prevents storing arrays of food inside the main orders table, keeping the SQL clean, searchable, and strictly relational.