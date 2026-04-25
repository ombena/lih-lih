Feature PRD: Store Profile Completion & Status Guard

Project: LihLih Store Dashboard
Feature: Settings View - Store Profile & Location Capture
Design System: Kinetic Oasis

1. Executive Summary

Currently, the StoreSettings.jsx view has a functional toggle to open or close the store. However, for the platform to function, drivers and clients need the store's exact geographic coordinates. This feature introduces a "Profile Guard": A store cannot toggle its status to "Ouverte" (Open) unless its profile information (Phone, Address, and GPS Coordinates) is complete.

To align with our 100% Free and Open-Source (FOSS) strategy, we will not use expensive Map APIs for location picking. Instead, we will use the device's native HTML5 Geolocation API to capture the exact coordinates of the restaurant tablet with a single tap.

2. Phase 1: Backend Logic & Validation (Express.js)

We need to create endpoints to save the store's information and enforce the validation rule at the server level.

2.1. Update Store Profile Endpoint

Route: PUT /api/stores/:id

Purpose: Updates the store's details (phone_number, wilaya, baladia, street, lat, lng).

Behavior: Receives a JSON payload from the frontend and updates the corresponding fields in the Store table using Prisma.

2.2. The "Go Online" Guard

Route: PATCH /api/stores/:id/status (Assuming this handles the open/close toggle).

Validation Logic: If the request attempts to set is_open = true (or equivalent status), the backend must first query the store.

const store = await prisma.store.findUnique({ where: { id: storeId } });

if (!store.lat || !store.lng || !store.phone_number) {
return res.status(400).json({
error: "Profile incomplete",
message: "Veuillez configurer votre position GPS et vos coordonnées avant d'ouvrir la boutique."
});
}

3. Phase 2: Frontend Architecture (StoreSettings.jsx)

The Settings view must be expanded to include a Profile Form, and the master toggle must visually reflect the locked state if data is missing.

3.1. The Profile Form Section

Add a new section below the master toggle called "Profil de l'établissement".

Inputs (using OasisInput):

Numéro de téléphone (Phone Number)

Wilaya & Baladia

Adresse (Street Name)

The GPS Capture Button: \* Add a KineticButton labeled "📍 Capturer ma position GPS".

Interaction: Uses navigator.geolocation.getCurrentPosition().

Success: Displays a green StatusBadge saying "Position enregistrée (Lat: 34.67, Lng: 3.25)".

Error: Uses an OasisToast to warn the user if they denied location permissions.

Save Button: A button to trigger the PUT request to the backend.

3.2. The "Profile Guard" Toggle Logic

The existing KineticSwitch must be upgraded to check the store's state.

Check State: Create a boolean variable const isProfileComplete = store.lat && store.lng && store.phone_number;

Disabled State: If isProfileComplete is false:

The KineticSwitch receives a disabled={true} prop (which we built to show 50% opacity and a not-allowed cursor).

We add a warning banner (using AlertCircle icon) right below the switch: "⚠️ Vous devez compléter votre profil et capturer votre position GPS pour recevoir des commandes."

4. User Flow (The Store Manager Experience)

The store manager opens the app for the first time.

They navigate to Paramètres.

They try to tap "Boutique Fermée" to open the store. The toggle is greyed out and unclickable. A warning tells them to complete their profile.

They scroll down to the new Profil section.

They fill in their phone number and street address.

They tap the "Capturer ma position GPS" button while standing inside their restaurant. The tablet asks for Location Permission. They click "Allow".

They tap "Enregistrer" (Save).

The master toggle instantly lights up, unlocking the system. They tap it, the store is now "Boutique Ouverte", and they are ready to make money!

5. Acceptance Criteria

[ ] Backend PUT /api/stores/:id route is created and tested.

[ ] Backend PATCH status route successfully blocks opening the store if lat/lng are null.

[ ] Frontend StoreSettings.jsx includes the new Profile form.

[ ] Frontend successfully utilizes the HTML5 Geolocation API to fetch coordinates without requiring a map UI.

[ ] The KineticSwitch for opening the store is completely disabled and locked if the required profile fields are empty.

[ ] Feedback is provided to the user via UI alerts/banners explaining exactly why they cannot open the store.
