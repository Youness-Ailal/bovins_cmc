# Frontend Implementation Rules
## Sketch (Pencil Design) to Code

---

### 1. Styling
- Use Tailwind CSS for all styling.
- Interpret spacing, sizing, and layout from the pencil sketch as closely as possible.
- Prefer Tailwind utility classes over custom CSS.
- Only use custom CSS when Tailwind cannot achieve the design (e.g., complex shadows, gradients).

---

### 2. Design Tokens
- Infer colors, spacing, font sizes, and radii from the sketch context and intent.
- Define them as reusable design tokens (CSS variables or Tailwind config).
- Do NOT hardcode colors directly in components.
- Use semantic naming (e.g., `primary`, `secondary`, `accent`, `muted`).
- When the sketch is grayscale or ambiguous, define a sensible default palette and **document your assumptions**.

---

### 3. Typography
- Infer font hierarchy from the sketch (headings, body, labels, captions) based on relative size and visual weight.
- Match relative sizes and weights as faithfully as possible.
- Define typography styles in Tailwind config or reusable classes.
- When exact font choices are not specified, select a clean, appropriate system font or Google Font and **document the choice**.

---

### 4. Layout & Spacing
- Interpret the sketch's spatial relationships (margins, paddings, gaps) and translate them to Tailwind's spacing scale.
- Use consistent spacing scale (prefer multiples of 4 or Tailwind scale).
- Avoid arbitrary pixel values unless necessary for visual accuracy.
- When spacing is ambiguous in the sketch, apply the closest Tailwind value and **note the assumption**.

---

### 5. Components
- Break UI into reusable components (Button, Card, Navbar, Footer, Section, etc.).
- Each component must be:
  - Reusable
  - Configurable via props (variants, sizes, states)
- Avoid duplication across pages.

---

### 6. Component Variants
- Implement variants using a clean pattern (e.g., class-variance-authority or conditional classes).
- Example: Button (primary, secondary, outline, disabled).

---

### 7. Structure
Use a clean folder structure:
```
/components
/sections
/pages
/styles
```
Keep components small and focused.

---

### 8. Responsiveness
- Infer responsive intent from the sketch (e.g., stacked vs side-by-side layouts).
- Use Tailwind breakpoints consistently.
- When responsive behavior is not drawn, apply sensible mobile-first defaults and **document the decisions**.

---

### 9. Interpretation Accuracy
- Faithfully translate the sketch into code while filling in gaps with reasonable defaults.
- Match:
  - Relative spacing and alignment
  - Visual hierarchy (font sizes, weights)
  - Inferred colors and border radius
  - Structural layout
- Prefer the closest Tailwind value; only fall back to arbitrary values if the visual difference is noticeable.
- **Always document any assumptions** made when the sketch is unclear or incomplete.

---

### 10. Naming
- Use clear, semantic naming for components and props.
- Avoid vague names like `box`, `wrapper`, etc.

---

### 11. Accessibility
- Use semantic HTML (`button`, `nav`, `header`, `main`, `footer`).
- Add `alt` text and `aria` labels where needed.
- Ensure sufficient color contrast, even when palette is self-defined.

---

### 12. Code Quality
- Keep code readable and well-structured.
- Avoid deeply nested divs.
- Prefer composition over large monolithic components.

---

### 13. Sketch Interpretation Guidelines
When reading a pencil design:
- **Boxes** → likely cards, sections, containers, or modals
- **Horizontal lines** → dividers, input fields, or table rows
- **Circles / rounded shapes** → avatars, icons, badges, or buttons
- **Arrows** → navigation flow, links, or interaction hints
- **Text scribbles** → identify as headings, labels, or body copy based on size and position
- **Repeated patterns** → identify as lists, grids, or repeating components
- **Shading or hatching** → may indicate background fills, images, or emphasis
- When intent is unclear, **ask for clarification** or **state your interpretation explicitly** before building.

---

### 14. Assumption Logging
For every non-trivial interpretation decision, log it in a brief comment block at the top of the component or page file:

```js
/**
 * Sketch Interpretation Notes:
 * - Primary color set to blue-600 (sketch was grayscale)
 * - Top section assumed to be a hero with centered text
 * - Nav links inferred from labeled boxes at top of sketch
 * - Mobile layout defaults to stacked single-column
 */
```

---

## Goal
Produce a clean, faithful translation of the pencil sketch into a pixel-accurate, reusable, scalable, and maintainable UI — with all assumptions clearly documented.
