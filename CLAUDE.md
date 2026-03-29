# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server on port 8080
npm run build      # Production build
npm run build:dev  # Development build
npm run lint       # ESLint checks
npm run preview    # Preview production build
```

No testing framework is configured — there are no unit/integration tests.

## Architecture

**Gorila Rise** is a Brazilian sports club management and training web app. Stack: React 18 + TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router v6, React Query v5.

### Routing & Providers

`src/App.tsx` is the root — it wraps the app with `QueryClientProvider`, `TooltipProvider`, two `Toaster` components (shadcn + Sonner), and `BrowserRouter`. All page routes are defined here with React Router.

### Pages vs Components

- `src/pages/` — route-level page components (Index, Login, Cadastro, PainelAtleta, Loja, etc.)
- `src/components/` — feature components (timers, diet calculator, exercise lists, subscription)
- `src/components/ui/` — shadcn/ui primitive components; treat as read-only library code

### Custom Hooks

All timer logic lives in `src/hooks/` as custom hooks (`useCountdown`, `useStopwatch`, `useAdvancedIntervalTimer`, `useIntervalTimer`). They follow a consistent pattern: `useRef` for interval tracking, `useEffect` for cleanup, and return `{ time, isRunning, start, pause, reset }`.

### Static Data

Two large TypeScript data files serve as the in-memory database:
- `src/data/movementsDatabase.ts` (~46KB) — exercise movements with categories, difficulty levels, muscle groups, equipment, and step-by-step instructions
- `src/data/sportsDatabase.ts` (~60KB) — sports information

There is no backend or external API integration.

### Path Aliases

`@/*` maps to `src/*`. Use `@/components`, `@/hooks`, `@/lib`, `@/data`, etc.

### Styling

- Tailwind CSS with a custom theme: primary `#231f20`, accent yellow `#f0c419`, dark `#1a1718`
- `cn()` utility from `src/lib/utils.ts` (clsx + tailwind-merge) for conditional classNames
- CSS variables (HSL) for dark mode via `next-themes`
- UI components use Radix UI primitives under the hood

### Forms & Validation

Forms use `react-hook-form` with `@hookform/resolvers/zod` for schema validation.

### TypeScript

Configured with relaxed checks (`strict: false`, no `strictNullChecks`, no unused variable enforcement). Target ES2020.

### Lovable Integration

Project was scaffolded by [Lovable](https://lovable.dev). The `lovable-tagger` dev dependency adds component metadata. Changes sync bidirectionally between Lovable and this Git repo.
