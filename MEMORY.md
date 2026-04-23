# BOVITRACK — Project Memory

> All values extracted from `Main-Design.pen` via the Pencil MCP — no guessing.

---

## Design System

### Colors
Defined in `frontend/app/globals.css` via Tailwind v4 `@theme`:

| Token | Value | Usage |
|---|---|---|
| `primary` | `#2D7A3A` | CTA buttons, active links, focus rings |
| `primary-dark` | `#245f2e` | Button hover state |
| `primary-light` | `#e8f5ec` | Outline button hover fill |
| `muted` | `#6B7280` | Subtitles, footer notes |
| `hint` | `#9CA3AF` | Placeholders, helper text |
| `border` | `#E5E2DD` | Input borders |
| `foreground` | `#1A1A1A` | Primary text (titles, labels) |
| `background` | `#ffffff` | Page / form panel background |

Auth brand panel solid bg: `#1B2E1F` — baked into `/public/auth-brand.jpg`.

### Fonts
Loaded in `app/layout.tsx` via `next/font/google`. Mapped in `globals.css @theme inline`:

| Variable | Font | Usage |
|---|---|---|
| `--font-dm-sans` → `font-dm-sans` | DM Sans 400/500/600/700 | Titles, button labels |
| `--font-inter` → `font-inter` | Inter | Body, labels, links, helper text |

### Typography Scale (exact Pencil values)
| Role | Font | Size | Weight | Color |
|---|---|---|---|---|
| Page title | DM Sans | 32px | 700 | `#1A1A1A` |
| Subtitle | Inter | 15px | 400 | `#6B7280` |
| Form label | Inter | 14px | 500 | `#1A1A1A` |
| Button text | DM Sans | 15px | 600 | `#FFFFFF` |
| Link text | Inter | 13px | 500 | `#2D7A3A` |
| Helper/hint | Inter | 12px | 400 | `#9CA3AF` |
| Footer note | Inter | 13px | 400 | `#6B7280` |
| Brand tagline | Inter | 16px | 400 | `#C8D9CC` |

Title letter-spacing: `-0.5px` (applied via `style` prop).

### Spacing (from Pencil layout)
| Location | Value |
|---|---|
| Form container max-width | `400px` |
| Brand panel width | `540px` (fixed) |
| Right panel padding | `80px` horizontal, `48px` vertical |
| Gap between form sections | `32px` (gap-8) |
| Gap between fields | `20px` (gap-5) |
| Gap label → input | `6px` (gap-1.5) |
| Logo → tagline gap | `24px` |

---

## Components

### `components/ui/Button.tsx`
**Props:** `variant` (`'primary' | 'outline'`, default `'primary'`), `fullWidth` (`boolean`), all `ButtonHTMLAttributes`.

**Spec:** h-12 (48px), rounded (6px), DM Sans 15px/600, `bg-primary` (`#2D7A3A`), white text.

### `components/ui/InputField.tsx`
**Props:** `label` (string), `helperText` (string?), `error` (string?), `id` (string?), all `InputHTMLAttributes`.

**Spec:** h-11 (44px), border `#E5E2DD` 1px, rounded (6px), px-[14px], Inter 14px, placeholder `#9CA3AF`.

### `components/auth/AuthBrand.tsx`
Left brand panel composed from separate reusable assets. Props: none.

| Asset | Path | Usage |
|---|---|---|
| Cattle barn photo | `/public/auth-bg.png` | Background (auth panel only) |
| White logo | `/public/logo-white.png` | Dark surfaces: auth panel, future dark navbar |
| Green logo | `/public/logo-green.png` | Light surfaces: navbar, headers, light backgrounds |

Rendering layers (bottom → top):
1. `/public/auth-bg.png` — `next/image` with `fill` + `object-cover`
2. Dark overlay — `rgba(27, 46, 31, 0.72)` (matches `#1B2E1F` tint from design)
3. `/public/logo-white.png` — 150×148px centered
4. Tagline — `#C8D9CC` Inter 16px, max-width 240px

Hidden below `lg` breakpoint.

---

## Folder Structure

```
frontend/
├── app/
│   ├── (auth)/                       # Route group — shares AuthGroupLayout
│   │   ├── layout.tsx                # h-screen flex: AuthBrand + white right panel
│   │   ├── login/page.tsx            # /login — AUTH-01
│   │   ├── forgot-password/page.tsx  # /forgot-password — AUTH-02
│   │   └── reset-password/page.tsx   # /reset-password — AUTH-03
│   ├── globals.css                   # @theme color tokens + @theme inline fonts
│   ├── layout.tsx                    # Root: DM Sans + Inter fonts, lang="fr"
│   └── page.tsx                      # redirect('/login')
├── components/
│   ├── auth/
│   │   └── AuthBrand.tsx             # Left panel image (540px, hidden on mobile)
│   └── ui/
│       ├── Button.tsx                # primary / outline variants
│       └── InputField.tsx            # label + input + helper/error
└── public/
    ├── auth-bg.png                   # Cattle barn photo (left_bar_cow.png from PFE/)
    ├── logo-white.png                # BOVITRACK logo for dark surfaces (navbar, etc.)
    └── logo-green.png                # BOVITRACK logo for light surfaces (headers, etc.)
```

---

## Pages Implemented

| Route | File | Pencil Ref |
|---|---|---|
| `/login` | `app/(auth)/login/page.tsx` | AUTH-01 (node `RyodY`) |
| `/forgot-password` | `app/(auth)/forgot-password/page.tsx` | AUTH-02 (node `mZ40X`) |
| `/reset-password` | `app/(auth)/reset-password/page.tsx` | AUTH-03 (node `PHKdA`) |

Pencil source file: `/C:/Users/Youness/Desktop/PFE/Main-Design.pen`

---

## Checklist for Adding New Pages

- [ ] Identify the Pencil node ID for the new screen — use `mcp__pencil__get_editor_state` + `batch_get` to read exact values (colors, spacing, fonts, sizes).
- [ ] Choose the route group: auth → `app/(auth)/`, dashboard → `app/(dashboard)/` (create new group + layout if needed).
- [ ] Create `page.tsx` with `"use client"` if the page uses React state or events.
- [ ] Use `font-dm-sans` for headings/buttons, `font-inter` for everything else.
- [ ] Use design tokens: `text-primary`, `bg-primary`, `text-muted`, `text-hint`, `border-border` — never hardcode hex values in components.
- [ ] Reuse `Button` and `InputField` from `components/ui/`. Add new primitives there if missing.
- [ ] Export any new image assets from Pencil with `mcp__pencil__export_nodes` → save to `public/`.
- [ ] Run `npm run build` to confirm zero TypeScript or compilation errors.
