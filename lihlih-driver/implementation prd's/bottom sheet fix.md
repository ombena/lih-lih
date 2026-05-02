Bug Fix: The "Phantom List" Bottom Sheet Glitch

Project: LihLih Driver App
Target Screen: screens/AvailableOrdersScreen.tsx
Issue: When selecting a store from the feed, the Bottom Sheet briefly displays the order list from the previously selected store before showing the new loading state.

1. The Root Cause

React Native's Gorhom BottomSheet stays mounted in the background even when closed (at index={-1}).
Currently, when the user swipes the sheet down to close it, the selectedStore state is never cleared. It still holds the previous store's data.
When openSheet is called for a new store, .expand() fires simultaneously with the state update. The sheet begins its slide-up animation instantly, showing the old cached data for a few frames before React finishes painting the new loading state.

2. The Solution

We need to do two things to ensure a perfectly clean transition:

Clear the state on close: Wipe selectedStore clean the moment the sheet is fully closed.

Micro-delay the animation: Let React update the UI to the "Loading" state before triggering the slide-up animation.

3. Implementation Instructions for the Developer

Step 1: Add a Sheet Change Handler

Add this function inside AvailableOrdersScreen.tsx (above your return statement). This will wipe the data when the driver swipes the sheet away.

const handleSheetChanges = (index: number) => {
  if (index === -1) {
    // The sheet is fully closed. Wipe the old data to prevent ghosts!
    setSelectedStore(null);
    setIsLoadingDetails(false);
  }
};


Step 2: Update the BottomSheet Component

Attach the new handler to the onChange prop of the Bottom Sheet.

<BottomSheet
  ref={bottomSheetRef}
  index={-1}
  snapPoints={snapPoints}
  enablePanDownToClose={true}
  onChange={handleSheetChanges} /* <-- ADD THIS PROP */
  backdropComponent={renderBackdrop}
  backgroundStyle={styles.sheetBackground}
  handleIndicatorStyle={styles.sheetIndicator}
>


Step 3: Update the openSheet Function

Modify your existing openSheet function to use requestAnimationFrame. This tiny adjustment forces the app to render the new "Loading" state first, and then animate the sheet upward.

const openSheet = async (store: any) => {
  // 1. Set the new store and loading state FIRST
  setSelectedStore({ ...store, orders_list: [] });
  setIsLoadingDetails(true);

  // 2. Wait for the next UI frame so React paints the Loader, THEN expand
  requestAnimationFrame(() => {
    bottomSheetRef.current?.expand();
  });

  // 3. Fetch the actual data
  try {
    const fetchPromise = await fetch(`${API_BASE_URL}/stores/${store.id}/active-orders`);

    if (fetchPromise.ok) {
      const data = await fetchPromise.json();
      const mappedOrders = data.map((o: any) => ({
        id: o.id.toString(),
        items: o.items ? o.items.map((i: any) => `${i.quantity}x ${i.food_name}`).join(', ') : 'Articles inconnus',
        address: `Livraison (Lat: ${Number(o.dropoff_lat).toFixed(3)}, Lng: ${Number(o.dropoff_lng).toFixed(3)})`,
      }));
      setSelectedStore({ ...store, orders_list: mappedOrders });
    }
  } catch (error) {
    console.error("Failed to fetch store details:", error);
  } finally {
    setIsLoadingDetails(false);
  }
};


4. Acceptance Criteria (DoD)

[ ] Swiping down to close the Bottom Sheet successfully resets selectedStore to null.

[ ] Tapping a new store instantly shows the OasisPulse or the Loading Text, with zero visual bleed-over from the previously clicked store.