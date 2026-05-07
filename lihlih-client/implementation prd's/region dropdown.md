Feature PRD: Dynamic Region Activation (Wilaya/Baladia)

Project: LihLih Platform (Admin, Backend, & Mobile Apps)
Feature: Over-The-Air (OTA) City Launches
Status: Architecture Phase

1. Executive Summary

To scale LihLih rapidly across Algeria, the platform must support "Over-The-Air" city launches. When the business decides to expand to a new Wilaya (e.g., Djelfa) or a new Baladia within an active Wilaya, the Admin must be able to activate it from the backend dashboard.

Once activated, all three apps (Client, Driver, Store) automatically download the updated list of active regions during their boot sequence. This ensures users only see dropdown options for cities where LihLih is actively operating, completely eliminating the need for App Store/Play Store updates to launch in a new city.

2. Phase 1: Database Architecture (schema.prisma)

To manage this cleanly in the Admin Dashboard, we need to add relational tables for Wilayas and Baladias, equipped with an is_active toggle.

model Wilaya {
id Int @id @default(autoincrement())
code String @unique // e.g., "17" for Djelfa, "03" for Laghouat
name String // e.g., "Laghouat"
is_active Boolean @default(false) // Admin toggles this to launch the city

baladias Baladia[]
}

model Baladia {
id Int @id @default(autoincrement())
wilaya_id Int
name String // e.g., "Hassi Bahbah"
is_active Boolean @default(false) // Admin toggles this to open specific zones

wilaya Wilaya @relation(fields: [wilaya_id], references: [id])
}

Developer Note: You can pre-seed the database with all 58 Wilayas and their 1541 Baladias set to is_active: false. The Admin simply flips the switch when ready.

3. Phase 2: Backend API (systemController.ts)

The backend needs a highly optimized, public endpoint that returns the active regions in a format that is incredibly easy for the mobile apps to read and render in cascading dropdowns.

Endpoint: GET /api/system/regions

Logic: Fetch all Wilaya records where is_active = true, including their nested Baladia records where is_active = true.

export const getActiveRegions = async (req: Request, res: Response) => {
try {
const activeWilayas = await prisma.wilaya.findMany({
where: { is_active: true },
include: {
baladias: {
where: { is_active: true },
select: { id: true, name: true }
}
},
orderBy: { name: 'asc' }
});

    // Formatting into a clean Dictionary/Map for O(1) frontend lookups
    const regionMap: Record<string, string[]> = {};

    activeWilayas.forEach(wilaya => {
      regionMap[wilaya.name] = wilaya.baladias.map(b => b.name);
    });

    // Example Output:
    // {
    //   "Laghouat": ["Laghouat Ville", "Hassi Bahbah", "Aflou"],
    //   "Djelfa": ["Djelfa Centre", "Ain Oussera"]
    // }

    res.json(regionMap);

} catch (error) {
res.status(500).json({ error: "Failed to fetch active regions" });
}
};

4. Phase 3: Mobile App Sync & Dropdown Logic

This logic applies to the Client App (Location Gate / Address Presets) and the Driver App (Registration).

4.1. The Background Sync

During the Splash Screen boot sequence, the app calls GET /api/system/regions and saves the resulting JSON object into AsyncStorage under the key @lihlih_active_regions.

4.2. The Cascading Dropdowns (OasisSelect)

When a user is presented with the Location Gate:

Wilaya Dropdown: Reads Object.keys(activeRegions) to populate the first list (e.g., ["Laghouat", "Djelfa"]).

Baladia Dropdown: Remains disabled until the Wilaya is selected.

Cascading Update: If the user selects "Laghouat", the second dropdown dynamically populates using activeRegions["Laghouat"] (e.g., ["Laghouat Ville", "Hassi Bahbah"]).

4.3. Separation of Concerns (React Native Architecture)

To keep the main application files (App.tsx and DiscoveryScreen.tsx) lightweight, the developer must strictly separate the region logic into three distinct layers:

The Service Layer (src/services/systemAPI.ts):
Contains only the pure fetch or axios call to GET /api/system/regions.

The Custom Hook (src/hooks/useRegionSync.ts):
Manages the "brain" work: checking AsyncStorage, calling the API if needed, and managing the React state.

export const useRegionSync = () => {
// Logic to check AsyncStorage, call systemAPI, and update local state
// Returns { activeRegions, isLoading, syncRegions }
}

The Isolated UI Component (src/components/LocationGate.tsx):
A dedicated component that consumes the hook and renders the cascading OasisSelect dropdowns. The main screens simply import <LocationGate /> without worrying about the underlying data fetching or caching logic.

5. Acceptance Criteria (DoD)

[ ] schema.prisma is updated with Wilaya and Baladia models and relationships.

[ ] Database is seeded with Algerian regions (defaulting to is_active: false).

[ ] Backend provides GET /api/system/regions returning a formatted, nested JSON of only the active regions.

[ ] Admin Dashboard allows toggling is_active for any Wilaya or Baladia.

[ ] Frontend implements a clean 3-layer architecture (Service, Hook, Component) to handle the data.

[ ] Mobile apps download this JSON during the Splash Screen boot sequence via the isolated hook.

[ ] App location dropdowns dynamically populate based on the downloaded active regions, with the Baladia list correctly cascading from the selected Wilaya.
