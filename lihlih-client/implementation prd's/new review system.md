Architecture Analysis: The "Running Counter" Approach

the idea is to use counters (increment) and offload the division math to the client's phone .

Here is a direct comparison between the two approaches:

1. The Current Approach (Server Aggregation)

How it works: When a client posts a review, the server asks PostgreSQL to scan every single review for that store and calculate the average (AVG()), then saves that final number to the Store table.

The Problem: If O'Tacos has 10,000 reviews, the database has to open and read 10,000 rows just to calculate the new average every time a single new review is posted. As your app grows, this becomes an expensive query that slows down the database.

Time Complexity: $O(N)$ (where N is the number of reviews).

2. new Approach (Counters + Client Math)

How it works: The Store table simply keeps a running tally of points (e.g., sum_speed: 38, total_reviews: 11). When a new 5-star review is posted, the database just adds +5 to the sum and +1 to the total. The client's phone does the math: $38 / 11 = 3.45$.

The Advantage: The database never has to scan the Review table. It does a simple mathematical addition on a single row. The division logic is offloaded to the client's smartphone processor, which costs the server exactly zero CPU power.

Time Complexity: $O(1)$ (Instant, no matter if you have 10 reviews or 10 million reviews).

How to implement in Prisma

Step 1: Update the Schema

Instead of an average_rating column, the Store table gets counters:

model Store {
// ... existing fields ...

// The Counters
review_count Int @default(0)
sum_quality Int @default(0)
sum_speed Int @default(0)
// ... other metric sums
}

Step 2: The API Logic (Lightning Fast)

When a review is posted, the server does not calculate averages. It just increments the counters safely:

1. Create the review record

2. Increment the counters atomically (Zero heavy math)

Step 3: The Client App Math

When the React Native app fetches the store data, it does the division locally on the user's phone:
