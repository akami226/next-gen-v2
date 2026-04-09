# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server
npm run build      # TypeScript compile + Vite build
npm run lint       # ESLint
npm run typecheck  # Type-check without emitting (tsc --noEmit)
npm run preview    # Preview production build locally
```

No test suite is configured.

## Environment

Requires a `.env` file with:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Architecture

### Routing
The app uses **hash-based routing** via `src/hooks/useHashRoute.ts` — there is no React Router. All route matching is a chain of `if (route === '/...')` blocks in `App.tsx`. Adding a new page means adding a new `if` branch there and a `navigate('/new-route')` call.

### App entry point
`App.tsx` is the single root component that:
- Guards the entire app with `PasswordGate` (simple staging password)
- Resolves the current hash route and renders the matching page
- Holds all top-level configurator state (selected car, wrap, tint, wheel, suspension)
- Provides three responsive layouts (mobile / tablet / desktop) for the configurator view

### 3D Configurator
The core feature is a 3D car configurator built with `@react-three/fiber`:

- **`CenterCanvas.tsx`** — the Three.js canvas. Loads GLB models from `/public/` via `useGLTF`. Applies post-processing (Bloom, N8AO, ACES tone mapping). Scales effects down on mobile.
- **`src/lib/meshClassifier.ts`** — scans a loaded GLB scene and classifies each mesh as `body`, `glass`, `rim`, `tire`, `light`, `exhaust`, or `interior` using mesh name heuristics.
- **`src/lib/carMaterials.ts`** — factory functions for every material type (`createWrapMaterial`, `createTintMaterial`, `createRimMaterialForWheel`, `getPermanentMaterial`). All use `THREE.MeshPhysicalMaterial`.
- GLB car files live in `/public/` and are referenced by filename in `src/data.json`.

### Data
- `src/data.json` — static car options (with exhaust variants) and shop listings.
- `src/data/wheelOptions.ts` — wheel options with material definitions.
- `src/data/pricing.ts` — price range calculation (`calculateBuildPrice`).
- `src/types.ts` — all shared TypeScript interfaces (`Wrap`, `Shop`, `BuildConfig`, `TintOption`, etc.).

### Auth & User Roles
- **`src/hooks/useAuth.ts`** — Supabase auth. After sign-in, checks `shop_owners` table to determine if the user is a shop owner. Exposes `isShopOwner` and `shopOwnerData`.
- **`src/hooks/useAdmin.ts`** — separate admin auth flow for the `/admin` routes.
- Three user roles exist in practice: unauthenticated visitor, authenticated regular user, authenticated shop owner. Shop owners see the `/dashboard` and receive real-time notifications via `src/hooks/useNotifications.ts`.

### Component Organization
- `src/components/` — shared/configurator UI components.
- `src/components/dashboard/` — shop owner dashboard tabs (profile, branding, leads, reviews, stats, subscription, etc.).
- `src/components/admin/` — admin panel views.
- `src/components/register/` — multi-step shop registration flow (`RegisterStepAccount` → `RegisterStepShop` → `RegisterStepSocial` → `RegisterStepConfirm`).
- `src/pages/` — top-level page components rendered by the router in `App.tsx`.

### Styling
Tailwind CSS with dark-first design (dark background `#080808`). Brand accent color is `#FF4500`. No component library — UI is hand-built with Tailwind + Framer Motion animations + Lucide React icons. Follow `.bolt/prompt`: prefer Lucide for icons, avoid adding new UI packages.

### Deployment
Netlify (`netlify.toml` present). The `main/` directory contains a pre-built output. The `public/_redirects` file handles SPA routing on Netlify.
