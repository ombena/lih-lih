# Design System Documentation: Kinetic Oasis

## 1. Overview & Creative North Star: The Kinetic Oasis
This design system is built upon the "Kinetic Oasis" philosophy—a vision of high-energy movement tempered by sophisticated serenity. We are moving away from the static, boxy layouts of the past decade. Instead, we embrace **Fluid Editorialism**. 

This system rejects the "template" look. It favors intentional asymmetry, overlapping elements that break the container, and a high-contrast typographic scale that feels like a premium digital magazine. We treat the screen not as a flat grid, but as a three-dimensional space where heat (vibrant oranges) and light (layered surfaces) interact to guide the user’s eye.

---

## 2. Colors: Heat & Horizon
The palette is a monochromatic evolution of solar energy. We have replaced the previous purple accents with a sophisticated **Tertiary Gold-Orange** to ensure the entire experience feels like a singular, cohesive atmosphere.

### The Palette (Material Design Tokens)
*   **Primary (`#ad2c00`):** The "Burnt Core." Used for brand-critical actions and primary focal points.
*   **Secondary (`#a83918`):** The "Heat Haze." A slightly muted, more earthen orange for supporting elements.
*   **Tertiary (`#705d00`):** The "Gilded Sand." A distinct, yellowish-orange used for high-end accents and specialized functional states.
*   **Surface Hierarchy:**
    *   `surface`: `#fff8f6` (The Base)
    *   `surface-container-low`: `#fff1ed`
    *   `surface-container-highest`: `#fddbd3`

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to section off content. Traditional dividers are prohibited. Boundaries must be defined solely through background color shifts. A `surface-container-low` section sitting on a `surface` background provides all the definition a premium UI requires.

### The "Glass & Gradient" Rule
To inject "soul" into the UI, utilize **Signature Textures**. 
*   **Hero CTAs:** Use a linear gradient from `primary` (#ad2c00) to `primary_container` (#d83900) at a 135-degree angle.
*   **Floating Navigation:** Use `surface_container_lowest` with a 70% opacity and a `24px` backdrop-blur to create a "frosted glass" effect that allows the Kinetic Oasis colors to bleed through.

---

## 3. Typography: Editorial Authority
We use **Plus Jakarta Sans** across all scales. Its wide aperture and modern geometric forms provide the "Kinetic" energy required for the Oasis.

*   **Display (lg/md/sm):** Use these for high-impact editorial moments. Use negative letter-spacing (-0.02em) to create a "tight," authoritative look.
*   **Headline (lg/md/sm):** Reserved for section introductions. Always pair a `headline-lg` with a `surface-container-high` background for maximum contrast.
*   **Body (lg/md/sm):** Set with generous line-height (1.6) to ensure the "Oasis" feels breathable and easy to navigate.
*   **Labels:** Always uppercase with +0.05em letter spacing to provide a "technical" counterpoint to the fluid display type.

---

## 4. Elevation & Depth: Tonal Layering
In this design system, shadows are a last resort, and borders are forbidden. Depth is achieved through the **Layering Principle**.

*   **Tonal Stacking:** Place a `surface_container_lowest` card on a `surface_container_low` background. This creates a natural "lift" that feels organic rather than digital.
*   **Ambient Shadows:** If a floating element (like a Modal or FAB) requires a shadow, use the `on_surface` color at 6% opacity with a 32px blur and an 8px Y-offset. This mimics natural sunlight rather than a harsh artificial drop-shadow.
*   **The "Ghost Border" Fallback:** If accessibility requires a stroke, use the `outline_variant` token at **20% opacity**. Never use 100% opaque borders.
*   **Glassmorphism:** Use semi-transparent layers for any UI that sits "above" the main content flow (e.g., Tooltips, Dropdowns).

---

## 5. Components: Fluid Primitives

### Buttons
*   **Primary:** High-gloss gradients (Primary to Primary Container). 8px (`1rem`) corner radius. No border.
*   **Secondary:** `secondary_container` background with `on_secondary_container` text.
*   **Tertiary:** Ghost style. No background, no border. Use `tertiary` (#705d00) for text.

### Cards & Lists
*   **The Forbidden Divider:** Never use a horizontal line to separate list items. Use 16px of vertical whitespace or alternating `surface_container_low` and `surface` backgrounds.
*   **Cards:** Use `surface_container_highest` for "Selected" states and `surface_container_low` for default states.

### Input Fields
*   **State Styling:** Use `surface_variant` for the input fill. The "active" state is indicated not by a thick border, but by a 2px bottom-stroke using the `primary` token.

### Interactive "Kinetic" Elements (New)
*   **The Progress Blade:** Instead of a standard progress bar, use a tapered gradient line that moves from `tertiary` to `primary`, emphasizing the "Kinetic" motion of the system.

---

## 6. Do's and Don'ts

### Do
*   **DO** use whitespace as a functional tool. If a layout feels "crowded," double the spacing scale.
*   **DO** overlap images over container edges to break the "web-page" feel.
*   **DO** use the `tertiary` gold-orange for success states or "premium" feature callouts to distinguish them from standard primary actions.

### Don't
*   **DON'T** use black (#000000) for text. Use `on_surface` (#291712) to maintain the warmth of the Oasis.
*   **DON'T** use 90-degree corners. Everything must adhere to the `Roundness 8` (1rem) standard to maintain the "Soft Minimalism" aesthetic.
*   **DON'T** use standard Material Design blue for links. Everything must exist within the solar spectrum (Oranges, Reds, Golds).

---
**Director's Final Note:**
Remember, the "Kinetic Oasis" is about the tension between high-energy color and calm, layered layouts. If the UI feels too loud, increase the "Oasis" (more surface layering). If it feels too boring, increase the "Kinetic" (more display typography and gradients).