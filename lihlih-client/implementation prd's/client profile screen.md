Feature PRD: Client Profile & Local Address Presets

Project: LihLih Client App (React Native / Expo)
Feature: Profile View, Local Preset Management, and Location Capture
Design System: Kinetic Oasis (Light Theme)

1. Executive Summary

The Profile screen allows clients to manage their personal information (Name, Phone) and multiple delivery addresses (Presets) entirely locally on their device. To enable a frictionless "One-Tap Checkout," the app requires at least one Default Preset saved in the phone's memory.

The Local-First Rule: The server does not know about a client's presets. All presets are saved locally using React Native's AsyncStorage. The server only receives the GPS coordinates at the exact moment an order is placed.

The Gate Logic: If a user has 0 local presets, the Discovery Screen is blocked, and they are routed to create their first preset (Wilaya, Baladia, GPS).

The Magic: If a user has >= 1 preset, the app automatically reads the "Default" preset from local storage, populates the Discovery Feed with stores from that specific Wilaya/Baladia, and pre-fills the checkout GPS data.

2. Phase 1: Local Storage Architecture (AsyncStorage)

Instead of creating new Prisma tables, the developers will define a local data structure to be saved on the user's phone.

Data Structure (Stored as JSON in AsyncStorage):

{
  "profile": {
    "name": "Amine",
    "phone_number": "0666112233"
  },
  "presets": [
    {
      "id": "uuid-1234",
      "preset_name": "Maison",
      "wilaya": "Laghouat",
      "baladia": "Hassi Bahbah",
      "street": "À côté de la mosquée",
      "lat": 34.6750,
      "lng": 3.2520,
      "is_default": true
    },
    {
      "id": "uuid-5678",
      "preset_name": "Université",
      "wilaya": "Laghouat",
      "baladia": "Laghouat Ville",
      "street": "Campus Central",
      "lat": 34.8011,
      "lng": 2.8467,
      "is_default": false
    }
  ]
}


3. Phase 2: Frontend Architecture & UI (ProfileView.jsx)

The Profile View will utilize the existing SurfaceCard, OasisInput, and KineticButton components. All save actions will write directly to AsyncStorage.

3.1. Section 1: Client Identity

UI: A simple SurfaceCard containing:

OasisInput for Name (e.g., "Comment vous appelez-vous ?").

OasisInput for Phone Number (e.g., "Numéro de téléphone").

A "Sauvegarder" (Save) button to update the local profile object.

3.2. Section 2: Preset List (Mes Adresses)

UI: A FlatList of SurfaceCard elements mapping over the local presets array.

Card Details: * Header: Preset Name (e.g., "🏠 Maison").

Subtext: Wilaya, Baladia, and Street details.

Interaction: * A KineticRadio or KineticSwitch inside each card labeled "Définir par défaut". Toggling this simply updates the local JSON array, setting is_default = true for the selected item and false for the rest.

A trailing edit/delete icon.

3.3. The Preset Editor Modal (Slide-up BottomSheetModal)

When clicking "+ Ajouter une adresse", a modal slides up reusing the Store App's logic.

Inputs:

OasisInput: Nom de l'adresse (e.g., "Maison").

OasisSelect: Wilaya.

OasisSelect: Baladia (Linked to Wilaya).

OasisTextArea: Détails exacts (e.g., "À côté de la mosquée...").

Location Capture (Reused Store Logic):

Button A: KineticButton labeled "📍 Capturer ma position GPS" (using expo-location).

Input B: OasisInput labeled "Ou coller vos coordonnées Google Maps".

Regex Parser: Reuses the exact Regex /(-?\d+\.\d+)[\s,]+(-?\d+\.\d+)/ built by the team previously to safely extract Lat/Lng on submit.

4. Phase 3: The Discovery Screen Handshake

The Discovery screen (DiscoveryView.jsx) must be updated to respect these local presets.

App Boot: App reads the JSON object from AsyncStorage.

The Gate Logic:

If 0 Presets: The Discovery Feed remains hidden. The "Location Gate" UI appears, forcing them to select Wilaya/Baladia and create their first saved preset.

If >= 1 Preset: The app finds the preset where is_default === true. It extracts the wilaya and baladia, saves them to local React state, and immediately calls the backend GET /api/stores/feed?wilaya=X&baladia=Y to populate the restaurants.

5. Phase 4: Order Checkout Integration

When the user is in their Cart and taps "Checkout":

The app automatically pulls the profile.phone_number, profile.name, and the is_default preset's lat/lng/street.

It populates the final Order Confirmation screen so the user doesn't have to type anything.

Upon confirming, it sends this final, combined payload to the backend POST /api/orders route.

6. Acceptance Criteria

[ ] React Native app successfully uses AsyncStorage to save, edit, and delete client profile info and presets entirely offline.

[ ] React Native app includes a Profile Screen matching the Kinetic Oasis design.

[ ] The GPS location capture logic (Expo + Regex manual paste) from the Store App is successfully reused in the Client App.

[ ] Toggling a preset to "Default" instantly re-fetches the Discovery screen using the new Wilaya/Baladia.

[ ] A user with no local presets is entirely blocked from seeing the Discovery Feed until they set their location.

[ ] Checkout screen automatically pulls data from the default local preset.