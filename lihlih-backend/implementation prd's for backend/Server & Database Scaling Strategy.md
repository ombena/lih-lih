# **Architecture Report: Scaling to Thousands of Orders/Day**

**Project:** LihLih Backend Infrastructure

**Goal:** Prepare the Node.js / Prisma / PostgreSQL / WebSocket stack to handle massive concurrent traffic without timeouts, deadlocks, or server crashes.

## **1\. The Scaling Roadmap (Current vs. Scale)**

When you hit thousands of orders a day, the bottleneck is rarely the CPU. The bottlenecks are **I/O (Input/Output)** and **Database Connections**.

Here is the exact breakdown of how your current implementations will behave under heavy load, the problems that will arise, and the techniques to solve them.

| Feature / Area | Current Implementation | Potential Problem at Scale | Solution / Tools & Techniques |
| :---- | :---- | :---- | :---- |
| **Database Connections** | Node.js opens a direct connection to PostgreSQL via Prisma for every request. | **Connection Exhaustion:** PostgreSQL has a hard limit on concurrent connections (often 100). During a lunch rush, Prisma will throw Timeout fetching connection from pool and crash. | **PgBouncer (Connection Pooling):** Place PgBouncer between Node and PostgreSQL. It multiplexes thousands of incoming requests into a small pool of active DB connections. |
| **Real-Time Sockets** | Socket.io holds connections in the Node.js server's RAM (Memory). | **Single Point of Failure:** You cannot add a 2nd server. If Server A has the Client and Server B has the Driver, they cannot talk to each other. | **Socket.io Redis Adapter:** Connect all Node.js instances to a Redis server. Redis acts as a message broker passing socket events between multiple servers. |
| **Driver GPS Pings** | Drivers ping their location to update the client's map (likely hitting the DB or Sockets directly). | **Database Meltdown:** 500 drivers updating GPS every 5 seconds \= 100 writes/second. This will lock up your PostgreSQL database and destroy SSD health. | **In-Memory Tracking:** NEVER save live GPS pings to SQL. Keep driver locations in **Redis (GeoHashes)** or just broadcast them directly via WebSockets without saving them. |
| **Order Claiming (Locks)** | Prisma $transaction with pessimistic locking (SELECT FOR UPDATE). | **Deadlocks / Slowdown:** If transactions take too long (e.g., waiting for an external API), it locks the table, causing other drivers to experience 10-second loading screens. | **Redis Distributed Locks (Redlock):** Alternatively, keep SQL transactions extremely short (under 50ms) by doing all validation *before* opening the transaction. |
| **Static Data Sync** | Splash screen calls GET /api/system/regions and hits PostgreSQL. | **Read Heavy Load:** 10,000 users opening the app at noon triggers 10,000 identical SQL queries simultaneously. | **Redis Caching:** Cache the regions and store directories in Redis. When the app asks for regions, Node reads it from RAM in 1 millisecond. PostgreSQL is never touched. |
| **Abandoned Orders** | Relying on Store/Driver to manually cancel or reject unfulfilled orders. | **Ghost State:** If a store goes offline, pending orders sit in "Waiting" status forever, confusing the system and clients. | **BullMQ (Message Queue):** When an order is created, push a job to BullMQ delayed by 15 mins. If the order is still "Waiting" when the job runs, the backend auto-cancels it. |

## **2\. The MVP Scaling Toolkit**

To implement these solutions, your developer only needs to introduce **two new pieces of infrastructure** to your stack. You do not need a massive Kubernetes cluster yet; you just need to manage memory and connections smartly.

### **Tool 1: Redis (The Magic Bullet)**

If you add one tool to handle scale, it must be Redis. Redis is an in-memory data structure store. It is lightning fast because it never touches a hard drive.

* **Use Case 1 (Caching):** Store the JSON response for /api/stores/directory. Instead of querying Prisma 1,000 times a minute, Node.js fetches the string from Redis instantly.  
* **Use Case 2 (Pub/Sub):** Allows you to spin up 3 instances of your Node.js backend. Redis ensures WebSockets communicate seamlessly across all of them.  
* **Use Case 3 (Rate Limiting):** Use Redis to prevent DDoS attacks or users spamming the "Create Order" button.

### **Tool 2: PgBouncer (The Database Shield)**

PostgreSQL handles complex queries beautifully, but it handles *connections* poorly. Every connection consumes \~10MB of RAM.

* **Implementation:** Your developer configures Prisma to connect to a local PgBouncer port instead of directly to Postgres. PgBouncer queues the requests and feeds them to Postgres in an orderly, efficient manner, making your $20/month VPS act like a $100/month server.

## **3\. High-Priority Backend Optimization (Actionable Code)**

Your developer should implement the "Cache-Aside" pattern for the Splash Screen boot sequence we designed earlier.

**Example: Caching the Active Regions**

import redis from '../config/redis'; // Assume Redis client is configured

export const getActiveRegions \= async (req: Request, res: Response) \=\> {  
  try {  
    // 1\. Check Redis RAM first (Takes 1 millisecond)  
    const cachedRegions \= await redis.get('system:active\_regions');  
    if (cachedRegions) {  
      return res.json(JSON.parse(cachedRegions));  
    }

    // 2\. If not in RAM, do the heavy PostgreSQL query  
    const activeWilayas \= await prisma.wilaya.findMany({ /\* ... \*/ });  
      
    // ... formatting logic ...

    // 3\. Save to Redis for the next 24 hours  
    await redis.set('system:active\_regions', JSON.stringify(regionMap), 'EX', 86400);

    res.json(regionMap);  
  } catch (error) {  
    // Error handling  
  }  
};

*Whenever an Admin updates a city in the dashboard, the backend simply runs redis.del('system:active\_regions') to force a fresh database pull on the next request.*

## **4\. Summary Checklist for the Tech Lead**

1. \[ \] Install and configure **Redis**.  
2. \[ \] Add **Socket.io Redis Adapter** to scale WebSockets horizontally.  
3. \[ \] Implement **PgBouncer** in front of PostgreSQL to prevent connection pooling crashes.  
4. \[ \] Move all Driver GPS ping tracking out of PostgreSQL and into Redis or pure WebSocket broadcasts.  
5. \[ \] Wrap GET endpoints used during the Splash Screen boot sequence with Redis caching.