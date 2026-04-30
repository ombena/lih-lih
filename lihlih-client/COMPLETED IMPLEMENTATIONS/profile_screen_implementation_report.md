# LihLih Client: Profile Screen & Infrastructure Implementation Report

This report outlines the complete feature set, architecture, and UI/UX refinements implemented during the foundation and Profile Management phases of the LihLih client application.

## 1. Infrastructure & Environment
* **Expo Development Builds:** Successfully migrated from Expo Go to custom `expo-dev-client` builds to support complex native modules (`expo-location`, `expo-clipboard`, `expo-crypto`).
* **Edge-to-Edge Rendering:** Implemented modern, bezel-less edge-to-edge Android UI rendering. Handled safe areas dynamically using `react-native-safe-area-context` to prevent UI elements from clashing with the system status bar and bottom navigation buttons.

## 2. Local Data Architecture
* **AsyncStorage Service:** Built `storageService.ts` to manage a local-first JSON document (`ClientData`) containing the user's Profile Identity and Address Presets.
* **Real-time Event Emitter:** Engineered a lightweight Pub/Sub event listener (`subscribeToClientData`) inside the storage service to broadcast profile changes, enabling separate components (like the Top Navigation Bar) to update instantly without a heavy global state manager like Redux.

## 3. Global Navigation Components
* **BottomNavBar:** Extracted into a standalone component (`BottomNavBar.tsx`). Features a glassmorphic design language consistent with the Kinetic Oasis UI, providing visual anchors for Home, Orders, and Profile.
* **TopNavBar:** Built a fixed top navigation bar (`TopNavBar.tsx`) featuring:
  * A personalized left-aligned greeting (`Salut, Amine`).
  * A right-aligned static address pill reflecting the currently selected default delivery preset.
  * Real-time updates tied to the `storageService` event emitter.

## 4. UI Primitives & Design System (`UIPrimitives.tsx`)
* **Focus States:** Enhanced the `OasisInput` component with native `onFocus` and `onBlur` listeners. Inputs dynamically transition from transparent borders with gray backgrounds to bold Primary colored borders with solid white backgrounds to emphasize active state.
* **Geometry Fixes:** Resolved visual clipping artifacts on `SurfaceCard` by assigning a permanent 2px transparent border to non-default cards, ensuring bounding box geometry remains perfectly identical during state transitions.

## 5. Profile & Identity Management
* **Strict Phone Formatting:** Implemented rigid Algerian phone number validation (`handlePhoneChange`):
  * Instantly blocks and removes non-numeric characters.
  * Forces the first digit to be exactly `0`.
  * Restricts the second digit to strictly `5`, `6`, or `7`.
  * Caps input length at 10 digits via a deeply passed `maxLength` prop.
* **Save Validation:** Prevents saving the profile unless the phone number meets the strict 10-digit requirement.

## 6. Address Management & GPS Workflows
* **Gorhom BottomSheet Modal:** Integrated a complex sliding modal for adding new addresses.
  * **Keyboard Interactivity:** Configured `keyboardBehavior="interactive"` and passed a `bottomSheet={true}` prop to inputs, transforming them into `BottomSheetTextInput`s. This allows the modal to intelligently push inputs up when the Android keyboard appears.
  * **System Button Clearance:** Applied `bottomInset` calculations to physically lift the modal above the transparent Android navigation buttons.
* **Dual Location Capture Systems:**
  1. **Native GPS Chip:** Uses `expo-location` to grab high-accuracy satellite coordinates directly from the physical phone sensor.
  2. **Manual Clipboard Parsing:** Built a side-by-side "Coordonnées manuelles" input and "📋 COLLER" button leveraging `expo-clipboard`. Uses advanced Regex filtering to automatically extract latitude and longitude from pasted Google Maps URLs (`@lat,lng` or `?q=lat,lng`) or raw numeric formats.
* **Preset Management:** Users can define multiple locations (Maison, Travail), delete them, and toggle the active "Default" preset, which instantly propagates to the global `TopNavBar`.
