Architecture: "AliExpress Style" Order Volume Counters

To show social proof (e.g., "1.5k+ Commandes") without destroying server performance, we will use the exact same Accumulator (Running Counter) architecture we used for the reviews. The database just keeps a tally, and the client's phone formats the number for display.

Step 1: Update the Prisma Schema

We need to add a simple counter to the Store table (and optionally the Item table if you want to show "500+ sold" on individual Tacos/Pizzas).

model Store {
  // ... existing fields
  
  // The Running Counter for Social Proof
  total_orders_count Int @default(0)
}

model Item {
  // ... existing fields
  
  // Optional: Track how many of this specific item have been sold
  total_sold_count   Int @default(0)
}


Step 2: The API Logic (The Atomic Increment)

We need to decide when this number goes up. The best place is in orderController.ts inside the completeOrder function (when the driver inputs the PIN). This ensures cancelled orders don't inflate the store's numbers.

// Inside completeOrder (when the delivery is successful)
await prisma.store.update({
  where: { id: store_id },
  data: {
    total_orders_count: { increment: 1 } // Instantly adds 1 with zero heavy math
  }
});

// Optional: If you want to track individual item sales too
for (const item of orderItems) {
  await prisma.item.update({
    where: { id: item.item_id },
    data: { total_sold_count: { increment: item.quantity } }
  });
}


Step 3: The Frontend Formatting Utility (React Native)

The database sends the exact raw number (e.g., 1534). We don't want to show "1534", we want to show "1.5k+". Your developer just needs to add this simple formatting function to your frontend utility files.

// utils/formatters.ts

export const formatSocialProofNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M+'; // e.g., 1.2M+
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k+'; // e.g., 1.5k+
  }
  if (num >= 100) {
    // For AliExpress style "500+ sold", round down to nearest 100
    return Math.floor(num / 100) * 100 + '+'; 
  }
  if (num >= 50) {
    return '50+';
  }
  // If it's a very new store with 15 orders, just show the exact number
  return num.toString(); 
}

// Examples of how this function behaves:
// formatSocialProofNumber(15)   -> "15"
// formatSocialProofNumber(63)   -> "50+"
// formatSocialProofNumber(520)  -> "500+"
// formatSocialProofNumber(1534) -> "1.5k+"


Step 4: UI Implementation

Now, inside your StoreCard.tsx on the Discovery Feed, you simply wrap the raw database number in that formatting function:

<View style={styles.socialProofBadge}>
  <ShoppingBag size={14} color={Colors.primary} />
  <Text style={styles.socialProofText}>
    {formatSocialProofNumber(store.total_orders_count)} Commandes
  </Text>
</View>


Why this is perfect for LihLih:

Zero Database Load: The database just adds +1. It never counts rows.

Psychological Marketing: Seeing "1.5k+ Commandes" makes a hesitant user trust the restaurant instantly.

Graceful Startup: By returning the exact number for low values (e.g., "15"), new restaurants don't look completely empty, but once they hit scale, they get the prestigious "k+" badge!