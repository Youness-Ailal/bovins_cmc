# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**BOVITRACK** — a cattle herd management web app (PFE project). The app is in French and targets farm managers. It has two parts:

- `frontend/` — Next.js 16 + React 19 + TypeScript + Tailwind v4
- `backend/` — Express 5 + Node.js (API stub, early stage)

## Commands

### Frontend (run from `frontend/`)
```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build (also type-checks)
npm run lint     # ESLint
```

### Backend (run from `backend/`)
```bash
npm run dev      # nodemon watch mode
npm start        # Production start
```

## Architecture

### Route Groups (Next.js App Router)

Two route groups with separate layouts:

- `app/(auth)/` — Split layout: fixed 540px brand panel (`AuthBrand`) + flex white form panel. Pages: `/login`, `/forgot-password`, `/reset-password`.
- `app/(dashboard)/` — Sidebar layout: fixed 260px `Sidebar` + scrollable content area. Pages: `/animaux`, `/lots`, `/parcelles`, and many planned routes (stocks, rations, sante, performance, administration).

`app/page.tsx` redirects to `/login`.

### Design System

All design tokens are defined in `frontend/app/globals.css` via Tailwind v4 `@theme`. **Never hardcode hex values in components** — use the token names:

| Token | Value | Usage |
|---|---|---|
| `primary` | `#2D7A3A` | CTAs, active state, focus rings |
| `sidebar` | `#1B2E1F` | Sidebar background |
| `surface` | `#F8F6F3` | Page background |
| `card` | `#FFFFFF` | Card / table background |
| `label` | `#1A1A1A` | Primary text |
| `subtle` | `#6B7280` | Secondary text |
| `placeholder` | `#9CA3AF` | Placeholder / table headers |
| `border-light` | `#F0EDE8` | Table borders, card borders |

Fonts loaded in `app/layout.tsx` via `next/font/google`:
- `font-dm-sans` — titles, button labels, page headings
- `font-inter` — body text, labels, table content, links

### Shared UI Components (`frontend/components/ui/`)

| Component | Key props | Notes |
|---|---|---|
| `Button` | `variant` (`primary`/`outline`), `fullWidth` | h-12, DM Sans 15px/600 |
| `InputField` | `label`, `helperText`, `error` | h-11, Inter 14px |
| `Badge` | `variant` (`phase-croissance`, `phase-engraissement`, `phase-finition`, `sain`, `malade`) | Colored pill tags |
| `DataTable<T>` | `columns`, `data`, `keyExtractor`, `pagination` | Generic typed table with pagination |
| `Icon` | `name` (lucide icon name), `size`, `strokeWidth` | Wraps lucide-react |
| `DatePicker` | — | Uses react-day-picker |
| `Select` | — | Custom select |

### Data (current state)

All data is currently **hardcoded static arrays** in each page file — there is no API integration yet. The backend is a stub returning `{ title: 'Express API', version: '1.0.0' }`.

### Adding New Pages

1. Use `app/(dashboard)/` for authenticated pages, `app/(auth)/` for auth pages.
2. Add `"use client"` if the page uses state or events.
3. Use `font-dm-sans` for headings, `font-inter` for everything else.
4. Use design tokens (no inline hex).
5. Reuse `DataTable`, `Badge`, `Icon`, `Button`, `InputField` from `components/ui/`.
6. Run `npm run build` to confirm zero TypeScript errors before committing.

### Team / Branch Structure

Each team member works on a dedicated branch and submits a PR:
- `tasks/hajar.md` — auth pages (forgot-password, reset-password)
- `tasks/mohamed.md` — dashboard/overview
- `tasks/safouane.md` — animal forms (formulaires animaux)
- `tasks/salma.md` — lots pages

The `tasks/` files contain full implementation instructions for each member.

## Important Notes

- The `frontend/AGENTS.md` warns that Next.js 16 has breaking changes from earlier versions. Before modifying Next.js-specific patterns (middleware, routing, image optimization), check `node_modules/next/dist/docs/`.
- The design source is a Pencil file at `C:/Users/Youness/Desktop/PFE/Main-Design.pen`. Use the Pencil MCP to extract exact values rather than guessing.
- `.claude/MEMORY.md` has authoritative design token values, component specs, and typography scale extracted from the Pencil design file.
