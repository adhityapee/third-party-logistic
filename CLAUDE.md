# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev          # Start dev server on port 3000
bun build        # Production build
bun test         # Run tests with Vitest
bun lint         # ESLint
bun typecheck    # TypeScript type check (no emit)
bun format       # Prettier write
bun check        # Prettier check (no write)
```

## Project Constraints (Hard Rules)

1. **Frontend only.** Do not build, scaffold, or design a backend. No API servers, no databases, no auth services, no background workers. The entire deliverable is a presentable mockup that runs in the browser.
2. **Mock data only.** All data is sourced from typed in-repo fixtures (e.g. `src/mocks/*.ts`). Loading states, empty states, error states, and async UX are simulated with timers if needed. Never wire to a real API.
3. **shadcn/ui is the only design system.** Use components from `src/components/ui/`. Do not create new component primitives. If a need cannot be met by composing existing shadcn primitives, raise it as a PRD change before reaching for a custom component.
4. **No em dashes in any output.** Use commas, colons, semicolons, periods, or parentheses. This applies to product copy, documentation, comments, commit messages, and PRDs. `--` is also banned.
5. **Copywriting follows `/marketing-skills:copywriting`.** Specific over vague, active over passive, clear over clever, no marketing buzzwords without substance.
6. **IA and UX quality is enforced via `/impeccable`.** Honor the shared design laws: OKLCH color, hierarchy via scale and weight contrast, no side-stripe borders, no gradient text, no glassmorphism by default, no hero-metric template, no identical card grids, no modal-as-first-thought.

## Architecture

**Stack**: TanStack Start (SSR meta-framework) + TanStack Router (file-based) + React 19 + TypeScript 6 + Tailwind CSS 4 + shadcn/ui (Base UI primitives).

**Reference doc**: `PRD.html` describes the product, the five personas, and the intended UX for each surface. Consult it when a route's purpose is unclear.

### Personas and surfaces

The mockup serves five personas, each with their own route group and a "home" route. The active persona is global app state (`currentRole` in the mock store) and is switched via `RoleSwitcher` (`src/components/role-switcher.tsx`), which also navigates to that persona's home:

| Role | Persona | Home route | Route files |
| --- | --- | --- | --- |
| `ops-manager` | Rina, DC Ops Manager | `/` | `index.tsx`, `dispatch.tsx`, `in-transit.tsx`, `catalog.tsx`, `stores.tsx`, `suggested-orders.tsx`, `reconciliation.tsx` |
| `supervisor` | Sari, Regional Supervisor | `/supervisor` | `supervisor/route.tsx`, `supervisor/index.tsx` |
| `exec` | Pak Hadi, Head of Supply Chain | `/exec` | `exec/route.tsx`, `exec/index.tsx` |
| `store` | Budi, Store Owner | `/store` | `store/route.tsx`, `store/index.tsx`, `store/draft.tsx`, `store/history.tsx`, `store/receive.$orderId.tsx`, `store/login.tsx` |
| `driver` | Andi, Driver | `/driver` | `driver/route.tsx`, `driver/index.tsx`, `driver/stop.$stopId.tsx`, `driver/login.tsx` |

A global `ScenarioSelector` (`src/components/scenario-selector.tsx`) switches between three demo data scenarios (`calm-tuesday`, `exception-friday`, `end-of-month-surge`); the active scenario seeds the mock store on load.

**Routing**: File-based routing in `src/routes/`. `__root.tsx` is the HTML shell, including `AppShell` (sidebar, top bar with `RoleSwitcher`/`ScenarioSelector`/`ErrorToggle`/`MockupBanner`) and the global `CommandPalette`/`Toaster`. `routeTree.gen.ts` is auto-generated; never edit it manually. Each persona's `route.tsx` provides a layout wrapper (e.g. `StoreLayout`, `DriverLayout`) around its child routes via `<Outlet />`.

**Mock data layer** (`src/mocks/`), all re-exported from `src/mocks/index.ts`:
- `types.ts`: shared domain types (`Order`, `Wave`, `Truck`, `SKU`, `Role`, `ScenarioId`, etc.)
- `fixtures/`: static reference data (`dcs.ts`, `stores.ts`, `skus.ts`, `trucks.ts`, `users.ts`)
- `scenarios/`: per-scenario seed data (`calm-tuesday.ts`, `exception-friday.ts`, `end-of-month-surge.ts`), built with shared helpers in `scenarios/_helpers.ts`
- `state.ts`: a Zustand store (`useMockStore`) holding all entity slices plus actions (confirm orders, create/dispatch waves, mark stops arrived/delivered, report exceptions, edit order lines, etc.) and selectors (`selectOrdersByStatus`, `selectStoreById`, etc.). This is the single source of truth for in-memory state mutations.
- `engine.ts`: `computeSuggestedOrders`, the replenishment logic that derives draft orders from inferred stock vs. reorder thresholds
- `clock.ts`: a fixed "demo now" timestamp (`getDemoNowIso`) and helpers (`tick`, `isoOffset`) so all relative times in the mockup are deterministic

**Components**: `src/components/ui/` holds shadcn components built on Base UI + CVA variants; do not add new primitives here beyond what shadcn generates. Persona-specific components live in `src/components/{dc,driver,exec,store,sup}/`. Shared chrome (sidebar, role/scenario switchers, command palette, error toggle, etc.) lives directly in `src/components/`. Use `cn()` from `src/lib/utils.ts` for class merging throughout (combines `clsx` + `tailwind-merge`).

**Styling**: Global styles and design tokens (OKLCH color space, CSS custom properties, light/dark theme) live in `src/styles.css`. Tailwind 4 with the engine plugin is configured in `vite.config.ts`. Prettier sorts Tailwind classes automatically via `cn()` and `cva()` function detection.

**Path alias**: `@/*` resolves to `./src/*`.

**Package manager**: Bun (see `bun.lock`).

**Icons**: `@hugeicons/react`, configured in `components.json` as the shadcn icon library.
