# Implementation Plan: Kinetic Sonar (High-Fidelity)

## 1. Objective
Translate the high-fidelity HTML/Tailwind mockup into a performant React Native implementation using `react-native-svg` and `react-native-reanimated`.

## 2. Component Architecture

### A. `KineticSonar.tsx` (The Engine)
- **SVG Canvas**: `340px` diameter.
- **Concentric Rings**: 3 dashed rings representing 1km, 2km, 3km.
- **Crosshairs**: X and Y dashed lines for orientation.
- **Sonar Ping**: An animated ripple circle that expands from `r=0` to `r=CENTER` with fading opacity.

### B. `SonarNode.tsx` (The Store Node)
- **Visual States**:
    - **Surge (5+ orders)**: Large dot, pulsing outer glow, white center point.
    - **Active (2-4 orders)**: Medium dot, breathing opacity.
    - **Quiet (0-1 orders)**: Small static dot.
- **Selected State**: A rotating dashed ring surrounding the node.
- **Interactions**: Tap to select node and trigger `onSelect(storeId)`.

### C. `RadarScreen.tsx` (The Screen)
- **Top Bar**: Sticky header with "GPS Active" pulsing indicator.
- **Next Sweep Timer**: A pill-shaped countdown showing "Next Sweep in Xs".
- **Bottom Sheet**: Using `@gorhom/bottom-sheet` to display:
    - High Demand badge (if applicable).
    - Store Name & Distance.
    - "Orders Ready" and "Estimated Fee" cards.
    - Kinetic action button ("Route to Store").

## 3. Technical Requirements

### Animation Logic (Reanimated 4)
- **Sonar Ping**: `useSharedValue` triggered every 5s. Expanding radius + fading opacity.
- **Node Pulse**: Continuous `withRepeat` for Surge/Active nodes.
- **Selection Ring**: Continuous `withRepeat` rotation animation.

### Math logic
- **Coordinate Conversion**:
  ```typescript
  const angleRad = (bearing - 90) * (Math.PI / 180);
  const screenRadius = (Math.min(distance, 3000) / 3000) * (CENTER - 10);
  const x = CENTER + screenRadius * Math.cos(angleRad);
  const y = CENTER + screenRadius * Math.sin(angleRad);
  ```

## 4. Development Phases

### Phase 1: SVG Layout & Static UI
- [ ] Implement Radar Background (Rings & Crosshairs).
- [ ] Create basic `SonarNode` with GPS plotting.
- [ ] Build the "Next Sweep" pill and pulsing GPS indicator in the header.

### Phase 2: High-Fidelity Animations
- [ ] Implement the expansion "Sonar Ping" effect.
- [ ] Add `withRepeat` pulsing to Surge nodes.
- [ ] Add rotation to the Selection Ring.

### Phase 3: Bottom Sheet & Interactivity
- [ ] Connect Node Taps to Bottom Sheet state.
- [ ] Implement "High Demand Area" badge logic.
- [ ] Add the "Route to Store" button with gradient styles.

### Phase 4: GPS Simulation Loop
- [ ] Create a `useInterval` hook (or similar) to decrement the countdown.
- [ ] Update mock store data (distance/orders) every 5s to simulate movement.
