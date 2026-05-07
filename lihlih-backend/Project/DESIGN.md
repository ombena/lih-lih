# Design System Specification: The Kinetic Oasis

## 1. Overview & Creative North Star
**Creative North Star: "The Kinetic Oasis"**

In the vibrant, high-energy landscape of Algeria—from the bustling streets of Algiers to the sun-drenched coastal paths—digital tools must be more than functional; they must be resilient and refreshing. This design system rejects the "boxed-in" look of standard delivery apps. Instead, it embraces **Kinetic Minimalism**: a high-contrast, editorial approach that prioritizes speed, legibility under harsh sunlight, and a premium feel that honors both Latin and Arabic scripts.

By utilizing **Intentional Asymmetry** and **Tonal Depth**, we create a signature experience that feels lightweight on 3G networks but heavyweight in brand authority. We move away from generic grids to a layout that feels curated, using breathing room and bold typography to guide the user’s eye through the heat of the dinner rush.

---

## 2. Colors & Atmospheric Depth
Our palette is designed for maximum "appetite appeal" and outdoor visibility. We use a "Vibrant Heat" primary against a "Cool Stone" neutral foundation.

### The "No-Line" Rule
**Borders are forbidden for sectioning.** To maintain a premium, modern aesthetic, designers must never use 1px solid lines to separate content. Boundaries are defined exclusively through:
1.  **Background Shifts:** Placing a `surface-container-low` card against a `surface` background.
2.  **Negative Space:** Using the spacing scale to create "invisible" gutters.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, physical layers.
*   **Base Layer:** `surface` (#f5f6f7) for the main application background.
*   **The Inset Layer:** Use `surface-container-lowest` (#ffffff) for primary content cards to make them "pop" forward.
*   **The Deep Layer:** Use `surface-container-high` (#e0e3e4) for persistent elements like navigation bars or secondary utility areas.

### The Glass & Gradient Rule
To prevent the UI from feeling "flat" or "cheap," main CTAs and Hero sections should utilize a subtle linear gradient:
*   **Primary Action Gradient:** From `primary` (#ae2900) to `primary_container` (#ff7855) at a 135-degree angle.
*   **Glassmorphism:** For floating headers or navigation overlays, use `surface` at 80% opacity with a `20px` backdrop-blur.

---

## 3. Typography: The Bilingual Voice
We use a dual-font strategy to ensure both Latin and Arabic scripts carry the same editorial weight. **Plus Jakarta Sans** provides a modern, geometric punch for headers, while **Inter** ensures maximum legibility for body text at small scales and high speeds.

*   **Display (Lg/Md/Sm):** `plusJakartaSans`. Used for hero promotions and category titles. These should use tight letter-spacing (-0.02em) to feel "tight" and professional.
*   **Headline & Title:** `plusJakartaSans`. High-contrast sizing to ensure a driver can read an order number from arm's length.
*   **Body & Label:** `inter`. Optimized for 3G loading and readability. In Arabic contexts, Inter’s x-height provides a clean baseline that pairs perfectly with the Latin glyphs.

**Identity Tip:** Use `headline-lg` for food names but pair it with a `label-sm` in `primary` all-caps for "New" or "Popular" tags to create an editorial, magazine-like hierarchy.

---

## 4. Elevation & Depth
In this design system, we do not "drop shadows"; we "layer light."

*   **The Layering Principle:** Instead of a shadow, place a `surface-container-lowest` card on top of a `surface-container` background. The subtle shift from `#ffffff` to `#e6e8ea` creates a sophisticated, "quiet" elevation.
*   **Ambient Shadows:** For floating action buttons (FABs) or high-priority modals, use a shadow with a blur radius of `32px`, an offset of `Y: 8px`, and a color of `on-surface` at 6% opacity. It should look like a soft glow, not a dark smudge.
*   **The Ghost Border:** If a form field needs a container against a white background, use `outline-variant` (#abadae) at **15% opacity**. This creates a "breathable" container that doesn't clutter the layout.

---

## 5. Components: The High-Tactility Kit
Designed for kitchen staff in high-heat environments and drivers on the move.

### Buttons: The Power Targets
*   **Primary:** Gradient-filled (`primary` to `primary_container`). Minimum height: `56px`. Corner radius: `md` (0.75rem).
*   **Secondary:** `secondary_container` (#ddddf9) background with `on_secondary_container` text. This provides a high-contrast but non-aggressive alternative for "Modify Order" or "View History."
*   **Tertiary:** No background, `primary` text, bold weight. Use only for low-priority actions like "Add a Note."

### Cards & Lists: The "No-Divider" Rule
Forbid the use of horizontal lines between list items. Use a `16px` vertical gap and subtle background alternating (Zebra-striping with `surface` and `surface-container-low`) to distinguish items. For food cards, use `xl` (1.5rem) corner radius on images to give a soft, organic feel.

### Input Fields: High-Visibility
*   **Active State:** Background `surface_container_lowest`, border 2px `primary`.
*   **Error State:** Background `on_error` (#ffefee), text `error` (#b31b25). 
*   **Tap Targets:** All inputs must have a minimum hit area of `48px` to accommodate rapid data entry in kitchens.

### Specialized Component: The "Status Beacon"
A large, edge-to-edge banner at the top of the screen using `tertiary_container` (#e094f8). It signals the current order state (e.g., "Cooking," "Out for Delivery") using `display-sm` typography. This provides instant status recognition without needing to read fine print.

---

## 6. Do’s and Don’ts

### Do
*   **Do** prioritize the Arabic script's right-to-left (RTL) flow; ensure the layout mirrors perfectly to maintain the "Editorial" balance.
*   **Do** use `surface-container-highest` for inactive states to keep them visible but clearly secondary.
*   **Do** use `primary_fixed` (#ff7855) for icons that represent "Action," such as a calling a customer or starting a route.

### Don't
*   **Don’t** use pure black (#000000) for text. Use `on_surface` (#2c2f30) to reduce eye strain in high-brightness outdoor conditions.
*   **Don’t** stack more than three levels of surface nesting. It ruins the lightweight, "Oasis" feel.
*   **Don’t** use small icons without text labels. For a delivery app, clarity beats "minimalist" mystery every time.

---
*Note to Designers: This system is designed to be invisible when it works best. Focus on the content (the food) and the action (the delivery). Let the typography and the orange heat of the Primary color do the heavy lifting.*