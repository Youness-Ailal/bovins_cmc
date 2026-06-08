# BOVITRACK — Frontend Design System

> Reference for building future pages. All tokens come from `app/globals.css`. Never hardcode hex values — use the token names below.

---

## 1. Color Tokens

### Brand

| Tailwind class | Value | When to use |
|---|---|---|
| `bg-primary` / `text-primary` | `#2D7A3A` | CTA buttons, active nav, focus rings, key metrics |
| `bg-primary-hover` | `#246B30` | Button hover state |
| `bg-primary-light` | `#E8F5EC` | Soft accent background |

### Surfaces

| Token | Value | When to use |
|---|---|---|
| `bg-surface` | `#F8F6F3` | Page background, table header/footer rows |
| `bg-card` | `#FFFFFF` | Cards, table body, page header bar |

### Text

| Token | Value | When to use |
|---|---|---|
| `text-label` | `#1A1A1A` | Primary text — titles, table IDs, values that matter |
| `text-subtle` | `#6B7280` | Secondary text — most table cell values |
| `text-placeholder` | `#9CA3AF` | Table column headers, helper text, icon muted state |

### Borders

| Token | Value | When to use |
|---|---|---|
| `border-border-light` | `#F0EDE8` | Cards, tables, separators |
| `border-border` | `#E5E2DD` | Form inputs |
| `border-border-ui` | `#CBCCC9` | Heavier UI borders |

### Status

| Token | Value | When to use |
|---|---|---|
| `text-danger` / `bg-danger` | `#DC2626` | Errors, danger buttons, delete |
| `bg-success` | `#22C55E` | Occupation bars (low) |
| `bg-warning` | `#EAB308` | Occupation bars (medium) |
| `text-info` / `bg-info` | `#3B82F6` | Informational |

### Sidebar (internal use only)

`bg-sidebar` `#1B2E1F` · `bg-sidebar-active` `#2D5A36` · `bg-sidebar-hover` `#264A2E` · `text-sidebar-text` `#C8D9CC`

---

## 2. Typography

All text uses **two fonts only**. No others.

| Font | Tailwind class | Use for |
|---|---|---|
| DM Sans | `font-dm-sans` | Page titles, card section headings, button labels, sidebar nav |
| Inter | `font-inter` | Everything else: body, table cells, labels, links, helper text |

### Type scale in practice

| Role | Classes |
|---|---|
| Page title (header bar) | `font-dm-sans text-xl font-semibold text-label` |
| Section heading (inside card) | `font-dm-sans text-sm font-semibold text-label` |
| Large metric value | `font-dm-sans text-base font-bold text-primary` |
| Auth page H1 | `font-dm-sans text-[32px] font-bold text-label` + `style={{ letterSpacing: "-0.5px" }}` |
| Table column header | `font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder` |
| Table cell — identifier | `font-inter text-[13px] font-semibold text-label` |
| Table cell — regular value | `font-inter text-[13px] text-subtle` |
| Detail row label | `font-inter text-[11px] text-placeholder` |
| Detail row value | `font-inter text-[13px] font-medium text-label` |
| Breadcrumb / route hint | `font-inter text-sm text-placeholder` |
| Helper / hint text | `font-inter text-xs text-placeholder leading-relaxed` |
| Error text | `font-inter text-xs text-danger` |

---

## 3. Layout Patterns

### Dashboard page shell

Every dashboard page wraps content in this structure:

```tsx
<div className="flex flex-1 flex-col overflow-hidden bg-surface">
  {/* Page header bar */}
  <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
    <div className="flex items-center gap-1.5">
      <span className="font-dm-sans text-xl font-semibold text-label">Page Title</span>
      <span className="font-inter text-sm text-placeholder">/ Breadcrumb</span>
    </div>
    {/* Optional: CTA button */}
  </header>

  {/* Scrollable content */}
  <div className="flex flex-1 flex-col gap-4 overflow-auto p-6">
    {/* cards / tables / etc. */}
  </div>
</div>
```

### Tab bar (detail pages)

```tsx
<div className="flex h-12 shrink-0 items-center border-b border-border-light bg-card px-6">
  {tabs.map((tab, i) => (
    <button
      key={tab}
      className={`flex h-12 items-center px-4 font-inter text-sm transition-colors ${
        i === activeTab
          ? "border-b-2 border-primary font-semibold text-primary"
          : "font-normal text-placeholder hover:text-subtle"
      }`}
    >
      {tab}
    </button>
  ))}
</div>
```

### Auth page form container

```tsx
<div className="w-full max-w-[400px] flex flex-col gap-8">
  {/* Heading block */}
  <div className="flex flex-col gap-2">
    <h1 className="font-dm-sans text-[32px] font-bold text-label" style={{ letterSpacing: "-0.5px" }}>
      Title
    </h1>
    <p className="font-inter text-[15px] text-subtle leading-relaxed">Subtitle</p>
  </div>
  {/* Form */}
  <form className="flex flex-col gap-5" noValidate>...</form>
</div>
```

---

## 4. Components

### `Button` — `components/ui/button.tsx`

Shadcn/CVA button. Variants: `default` (primary green), `destructive`, `outline`, `secondary`, `ghost`, `link`. Sizes: `default` h-9, `sm` h-8, `lg` h-10, `icon` h-9 w-9.

```tsx
import Button from "@/components/ui/button";

<Button>Se connecter</Button>
<Button variant="outline">Modifier</Button>
<Button variant="destructive">Supprimer</Button>
<Button size="icon"><Icon name="plus" size={16} /></Button>
```

> **Note:** There is also a legacy inline button pattern used in page files — `rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors`. Prefer `<Button>` going forward.

### `InputField` — `components/ui/InputField.tsx`

```tsx
import InputField from "@/components/ui/InputField";

<InputField
  label="Adresse email"
  id="email"                // optional — auto-derived from label if omitted
  type="email"
  placeholder="nom@exemple.com"
  helperText="We'll never share your email."  // shown when no error
  error="Email invalide"    // shown instead of helperText; turns border red
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

Specs: h-11, `border-border`, `bg-input`, `focus:ring-primary`.

### `Badge` — `components/ui/Badge.tsx`

```tsx
import Badge from "@/components/ui/Badge";

<Badge variant="phase-croissance">Croissance</Badge>
<Badge variant="phase-engraissement">Engraissement</Badge>
<Badge variant="phase-finition">Finition</Badge>
<Badge variant="sain">Sain</Badge>
<Badge variant="malade">Malade</Badge>
<Badge variant="origin">Né à la ferme</Badge>
<Badge variant="capacity">80 animaux</Badge>
```

### `Icon` — `components/ui/Icon.tsx`

Inline SVG sprites — no external requests. **Only the icons listed below are available.** To add a new icon, copy the lucide SVG path string into the `PATHS` record.

| `name` | Usage |
|---|---|
| `layout-dashboard` | Dashboard nav |
| `scan-line` | Animaux nav |
| `map-pin` | Parcelles nav |
| `package` | Stock nav |
| `utensils` | Rations nav |
| `heart-pulse` | Santé nav |
| `chart-bar` | Performance nav |
| `settings` | Administration nav |
| `log-out` | Sidebar logout |
| `plus` | Add/new buttons |
| `eye` | View action |
| `pencil` | Edit action |
| `save` | Save action |
| `chevron-left/right/down` | Navigation, dropdowns |
| `search` | Search input |
| `check` | Confirmation, status |
| `arrow-left` | Back navigation |
| `x` | Close, dismiss |
| `calendar` | DatePicker trigger |
| `tag` | Tagging |
| `triangle-alert` | Warnings |
| `syringe` | Santé/medical |
| `skull` | Mortality/critical |
| `scissors` | Sortie/slaughter |
| `trending-down` | Performance drop |

```tsx
import Icon from "@/components/ui/Icon";

<Icon name="plus" size={14} />
<Icon name="pencil" size={15} className="text-placeholder" />
<Icon name="eye" size={20} strokeWidth={2} />  // active state = strokeWidth 2, inactive = 1.75
```

### `DataTable<T>` — `components/ui/DataTable.tsx`

Generic typed table with header, rows, pagination. Prefer this over building raw tables inline.

```tsx
import DataTable, { Column } from "@/components/ui/DataTable";

const COLUMNS: Column<MyType>[] = [
  { key: "id", label: "Identifiant", width: "w-[110px]", render: (row) => <span className="font-inter text-[13px] font-semibold text-label">{row.id}</span> },
  { key: "name", label: "Nom", width: "w-[150px]" },  // plain text cell
  { key: "_actions", label: "Actions", width: "w-[60px]", align: "right", render: (row) => <ActionsCell row={row} /> },
];

<DataTable
  columns={COLUMNS}
  data={filteredData}
  keyExtractor={(row) => row.id}
  pagination={{ page: 1, total: 5, count: 48, onPrev: () => {}, onNext: () => {} }}
  rowHeight={54}  // optional, default 54
/>
```

### `DatePicker` — `components/ui/DatePicker.tsx`

```tsx
import DatePicker from "@/components/ui/DatePicker";

const [date, setDate] = useState<Date | undefined>();
<DatePicker value={date} onChange={setDate} placeholder="jj/mm/aaaa" />
```

Dates are formatted as `dd/MM/yyyy` in French locale via `date-fns/locale/fr`.

### `Select` — `components/ui/select.tsx`

Built on `@base-ui/react/select`.

```tsx
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

<Select value={value} onValueChange={setValue}>
  <SelectTrigger><SelectValue placeholder="Choisir…" /></SelectTrigger>
  <SelectContent>
    <SelectItem value="croissance">Croissance</SelectItem>
    <SelectItem value="engraissement">Engraissement</SelectItem>
  </SelectContent>
</Select>
```

---

## 5. Recurring Patterns

### Detail row (key-value pair)

Used inside info cards on detail pages (e.g., `/animaux/[id]`):

```tsx
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-inter text-[11px] text-placeholder">{label}</span>
      <span className="font-inter text-[13px] font-medium text-label">{value}</span>
    </div>
  );
}
```

### Occupation / progress bar

```tsx
function OccupationBar({ pct }: { pct: number }) {
  const color = pct >= 90 ? "bg-danger" : pct >= 70 ? "bg-warning" : "bg-success";
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-2 w-32 overflow-hidden rounded-full bg-surface">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="font-inter text-[13px] text-subtle">{pct}%</span>
    </div>
  );
}
```

### CTA button (primary, in header)

```tsx
<Link
  href="/animaux/nouveau"
  className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors"
>
  <Icon name="plus" size={14} />
  Nouvel animal
</Link>
```

### Secondary button (outline, in header)

```tsx
<Link
  href={`/animaux/${id}/modifier`}
  className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors"
>
  <Icon name="pencil" size={14} />
  Modifier
</Link>
```

### Danger button (outline)

```tsx
<button className="flex items-center gap-1.5 rounded-[6px] border border-danger bg-white px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-danger hover:bg-red-50 transition-colors">
  Enregistrer une sortie
</button>
```

### Filter bar (above tables)

```tsx
<div className="flex flex-wrap items-center gap-2 rounded-[8px] border border-border-light bg-card p-3">
  {["Race", "Phase", "Parcelle"].map((d) => (
    <button key={d} className="flex items-center gap-1 rounded-[6px] border border-border-light px-2.5 py-1.5 font-inter text-[13px] text-subtle hover:bg-surface transition-colors">
      {d}
      <Icon name="chevron-down" size={12} className="text-placeholder" />
    </button>
  ))}
  <div className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3 py-1.5">
    <Icon name="search" size={14} className="text-placeholder" />
    <input
      type="text"
      placeholder="Rechercher…"
      className="w-44 bg-transparent font-inter text-[13px] text-label placeholder:text-placeholder focus:outline-none"
    />
  </div>
</div>
```

### Info card (grid of 3 cards)

```tsx
<div className="flex gap-4">
  <div className="flex flex-1 flex-col gap-3 rounded-[10px] border border-border-light bg-card p-5">
    <span className="font-dm-sans text-sm font-semibold text-label">Section Title</span>
    <Row label="Field" value="Value" />
  </div>
  {/* repeat × 3 */}
</div>
```

### Animal/entity avatar circle

```tsx
<div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-primary font-dm-sans text-[22px] font-bold text-white">
  A
</div>
```

User avatar (sidebar, smaller): `h-[34px] w-[34px] text-xs`

---

## 6. Utilities

```ts
import { cn } from "@/lib/utils";  // twMerge + clsx
```

Use `cn()` whenever merging conditional Tailwind classes.

---

## 7. `"use client"` rules

- Pages with `useState`, `useEffect`, event handlers → add `"use client"` at top.
- Layout files, server-only pages (no state, no events) → no directive needed (they are Server Components by default).
- All `components/ui/` interactive components already have `"use client"` where needed.

---

## 8. Planned routes (not yet built)

Sidebar defines these routes — they need pages:

| Route | Section |
|---|---|
| `/dashboard` | Tableau de bord (overview/KPIs) |
| `/stocks` | Stock management |
| `/rations` | Ration management |
| `/sante` | Health records |
| `/performance` | Performance charts |
| `/administration` | Admin settings |
| `/animaux/[id]/sortie` | Animal exit form |
| `/animaux/[id]/modifier` | Animal edit form (stub exists) |
| `/parcelles/[id]` | Parcel detail |
