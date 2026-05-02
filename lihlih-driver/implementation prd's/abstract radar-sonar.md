Feature Implementation: Abstract Driver Radar & Hot Zones

1. Feature Overview
   The Driver Radar abandons heavy, traditional geographic maps (like Google Maps or Mapbox) in favor of a purely abstract, mathematical Kinetic Sonar. It gamifies the delivery experience by plotting nearby stores on a 2D circular canvas, using pulsing animations and "Vibrant Heat" colors to indicate order volume.
   Benefit: Zero map tile downloads, lightning-fast rendering on low-end devices, minimal battery consumption, and 100% FOSS.
2. Technical Stack (The Abstract Approach)
   Spatial Math: @turf/distance and @turf/bearing (Calculates the angles and distances between the driver's GPS and the stores' GPS instantly in JavaScript).
   Canvas Drawing: react-native-svg (Draws the radar circles, the glowing store nodes, and the heat gradients).
   Animations: react-native-reanimated (Handles the 60fps pulsing "heat" effects of the store nodes without blocking the UI thread).
3. The Math Conversion (GPS to Screen X/Y)
   To plot a store onto the SVG circle, the app performs the following local calculations:
   Define Radar Scope: Set a max radius (e.g., MAX_DISTANCE = 3000 meters). Any store beyond this is ignored or pinned to the edge.
   Calculate Distance (): Use Turf.js to find the distance between the Driver and the Store. Calculate the ratio: distance / MAX_DISTANCE. Multiply this by the physical radius of the SVG circle on the screen.
   Calculate Bearing (): Use Turf.js to find the angle from the Driver to the Store. Subtract 90 degrees so that North aligns with the top of the screen.
   Convert to Cartesian:
   const x = RADAR_CENTER_X + (screenRadius _ Math.cos(bearingInRadians));
   const y = RADAR_CENTER_Y + (screenRadius _ Math.sin(bearingInRadians));

4. UI/UX Execution: The "Kinetic Sonar"
   Visual Rules (Kinetic Oasis Design System)
   The Canvas: A dark or surface-container-high circle with faint, dashed concentric rings representing 1km, 2km, and 3km thresholds.
   Driver Position: Anchored perfectly in the center (cx, cy), represented by a sharp on-surface icon.
   Store Nodes (The Heat Indicators): Plotted at their calculated X/Y coordinates using SVG <Circle> elements.
   Cold Store (0-1 orders): Small 8px dot. Color: outline-variant (#abadae). No animation.
   Warm Store (2-4 orders): Medium 16px dot. Color: primary-container (#ff7855). Gentle opacity breathing.
   Hot Zone (5+ orders): Large 24px dot. Color: primary (#ae2900). Encased in an <Svg> <RadialGradient> that aggressively pulses outward, simulating intense heat/traffic.
5. React Native Implementation Guide (SVG + Turf)
   import React from 'react';
   import Svg, { Circle, Line, Defs, RadialGradient, Stop } from 'react-native-svg';
   import { distance, bearing, point } from '@turf/turf';
   import Animated, { useSharedValue, withRepeat, withTiming, useAnimatedProps } from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RADAR_SIZE = 300;
const CENTER = RADAR_SIZE / 2;
const MAX_RADIUS_METERS = 3000; // 3km

export const AbstractRadar = ({ driverLocation, stores }) => {
return (
<Svg width={RADAR_SIZE} height={RADAR_SIZE}>
{/_ Background Radar Rings _/}
<Circle cx={CENTER} cy={CENTER} r={CENTER - 10} stroke="#dadddf" strokeDasharray="4 4" fill="transparent" />
<Circle cx={CENTER} cy={CENTER} r={(CENTER - 10) / 2} stroke="#eff1f2" strokeDasharray="4 4" fill="transparent" />

      {/* Driver Center Dot */}
      <Circle cx={CENTER} cy={CENTER} r={6} fill="#2c2f30" />

      {/* Plotting the Stores */}
      {stores.map(store => {
        // 1. Math: Get Distance and Bearing
        const from = point([driverLocation.lng, driverLocation.lat]);
        const to = point([store.lng, store.lat]);

        const distMeters = distance(from, to, { units: 'meters' });
        const angleDeg = bearing(from, to) - 90; // -90 to point North Up
        const angleRad = angleDeg * (Math.PI / 180);

        // 2. Math: Convert to Screen X/Y
        // Clamp distance to edge of radar
        const displayDist = Math.min(distMeters, MAX_RADIUS_METERS);
        const screenRadius = (displayDist / MAX_RADIUS_METERS) * (CENTER - 10);

        const x = CENTER + (screenRadius * Math.cos(angleRad));
        const y = CENTER + (screenRadius * Math.sin(angleRad));

        // 3. Render Node based on Heat
        const isHot = store.active_orders >= 5;

        return (
          <React.Fragment key={store.id}>
            {isHot && (
              <AnimatedHeatNode cx={x} cy={y} />
            )}
            <Circle cx={x} cy={y} r={isHot ? 12 : 6} fill={isHot ? '#ae2900' : '#abadae'} />
          </React.Fragment>
        );
      })}
    </Svg>

);
};

6. Interaction Logic
   When the driver taps an SVG node, a BottomSheetModal slides up from the bottom of the screen displaying the exact Store Name, precise distance, and the list of available orders to accept.
