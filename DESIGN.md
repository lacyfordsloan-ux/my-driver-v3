# Design System Document

## 1. Overview & Creative North Star: "The Crimson Pulse"
This design system moves away from the generic "utility map" aesthetic of traditional ride-sharing apps. Instead, it adopts a **"Crimson Pulse"** philosophy—an editorial, high-end dark mode experience that treats urban mobility as a premium service. 

By utilizing intentional asymmetry, overlapping elements, and high-contrast typography, we create an environment that feels more like a luxury concierge than a basic tool. The system breaks the "template" look by prioritizing tonal depth over rigid lines, ensuring the interface feels like a fluid, living organism.

---

## 2. Colors & Surface Architecture

The palette is anchored in a deep obsidian base, punctuated by a surgical application of the primary accent.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section content. Boundaries must be defined strictly through background shifts or tonal transitions. 
*   Use `surface-container-low` for large content sections on a `surface` background.
*   Use `surface-container-highest` for interactive elements to provide natural contrast.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical, stacked layers.
*   **Layer 1 (The Void):** `surface` (#131313) — The base of the application.
*   **Layer 2 (The Street):** `surface-container-low` (#1C1B1B) — For secondary content areas.
*   **Layer 3 (The Vehicle):** `surface-container-high` (#2A2A2A) — For primary interactive cards and modules.

### The "Glass & Gradient" Rule
To avoid a flat, "cheap" look, floating elements (like the ride-tracking panel) should use **Glassmorphism**:
*   **Background:** `surface-variant` (#353535) at 60% opacity.
*   **Effect:** Backdrop blur of 20px.
*   **Gradient CTAs:** Primary buttons must use a linear gradient from `primary` (#FFB4A8) to `primary-container` (#FF5540) at a 135° angle to provide "soul" and kinetic energy.

---

## 3. Typography: Editorial Authority

We use a dual-font strategy to balance character with extreme readability.

*   **Display & Headlines (Manrope):** Chosen for its geometric precision. Use `headline-lg` for destination headers and `display-sm` for price points to create an authoritative, editorial feel. 
    *   *Russian Context:* "Куда едем?" (Where to?) should be set in `headline-lg` Bold to command attention.
*   **Body & Labels (Inter):** A workhorse for utility. Use `body-md` for driver details and `label-sm` for license plates.
    *   *Russian Context:* Ensure `letter-spacing` is set to -0.01em for Cyrillic body text to maintain a tight, premium look.

---

## 4. Elevation & Depth: Tonal Layering

Shadows and lines are crutches. This system uses **Tonal Layering** to define space.

*   **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` section to create a soft, natural "lift."
*   **Ambient Shadows:** For high-priority floating elements (like the "Request Ride" button), use an extra-diffused shadow: `0px 20px 40px rgba(0, 0, 0, 0.4)`. The shadow must never be pure black; it should feel like an occlusion of the ambient dark light.
*   **The "Ghost Border" Fallback:** If a container must be defined against a similar background, use a 1px border of `outline-variant` (#603E39) at **15% opacity**. Anything higher is a violation of the system's "fluid" nature.

---

## 5. Components

### Buttons (Кнопки)
*   **Primary:** Gradient `primary` to `primary-container`. Corner radius: `full`. Text: `title-sm` Uppercase.
*   **Secondary:** `surface-container-highest` background with `primary` text. No border.
*   **Tertiary:** Transparent background, `on-surface-variant` text.

### Cards & Lists (Карточки и Списки)
*   **Rule:** Forbid the use of divider lines between ride options. 
*   **Execution:** Separate "Economy," "Comfort," and "Business" classes using vertical white space (16px/1rem) and a subtle shift from `surface-container-low` to `surface-container-high` for the selected state.

### Input Fields (Поля ввода)
*   **Static:** `surface-container-lowest` background, `xl` (1.5rem) roundedness.
*   **Active:** A subtle "Ghost Border" (15% `primary`) appears to indicate focus. Helper text in `label-md` Russian: "Введите адрес подачи."

### Additional Component: The "Pulse" Map Marker
Instead of a flat pin, the map marker is a `primary` circle with a 20% opacity `surface-tint` outer ring that subtly pulses, mimicking a heartbeat—bringing the "Crimson Pulse" theme to life.

---

## 6. Do’s and Don’ts

### Do
*   **Do** use extreme contrast in typography (e.g., `display-sm` next to `label-sm`) to create an editorial hierarchy.
*   **Do** use Russian terminology that feels professional (e.g., use "Маршрут" instead of "Путь").
*   **Do** allow the background `surface` to "breathe" with wide margins (minimum 20px on mobile).

### Don't
*   **Don't** use 100% white (#FFFFFF) for body text; use `on-surface` (#E5E2E1) to reduce eye strain in dark mode.
*   **Don't** use standard Material Design ripples; use subtle opacity shifts for interaction states.
*   **Don't** use hard-edged rectangles. Everything should follow the Roundedness Scale, prioritizing `md` (0.75rem) and `xl` (1.5rem).

---

## 7. Spacing & Rhythm
Rhythm is achieved through a strict 8px grid, but layout is **intentionally asymmetrical**. For example, the ride price should be aligned to the far right, while the car description is offset slightly from the left icon, creating a dynamic diagonal tension that leads the eye across the screen.
