# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server on port 3001
npm run build      # Production build
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

No test runner is configured.

## Environment

Requires a `.env` file with:
```
VITE_API_URL=<backend API base URL>
```

## Architecture

This is a React + Vite admin dashboard for the FruitSnacks e-commerce platform. There is no SSR — it's a pure SPA.

**Core libraries:** React 18, React Router 6, TanStack React Query 5, React Hook Form, Tailwind CSS 3, Recharts.

### Data Fetching Pattern

All server state goes through React Query. Custom hooks in [src/hooks/](src/hooks/) wrap `useQuery` calls and are the primary data-fetching layer. The base API URL comes from `src/utils/baseURL.js` which reads `VITE_API_URL`. Auth uses cookies (`credentials: 'include'`), not tokens.

```js
// Typical hook pattern
export const useGetCategory = () =>
  useQuery({ queryKey: ['/api/v1/category'], queryFn: ... });
```

### State Management

- **AuthProvider** (`src/context/AuthProvider.jsx`): current admin user, fetched from `/admin_reg_log`
- **SettingProvider** (`src/context/SettingProvider.jsx`): app-wide settings (favicon, site title)
- React Query handles all server cache; Context handles only global client state

### Routing & Auth

Routes are defined in [src/routes/Route.jsx](src/routes/Route.jsx). Protected pages are wrapped with `PrivateRoute` (`src/routes/privateRoute/`). The dashboard layout is in [src/layout/DashboardLayout.jsx](src/layout/DashboardLayout.jsx) — it renders a collapsible sidebar and top navbar.

### Feature Module Convention

Each feature (Products, Orders, Categories, Campaigns, Coupons, Banners, etc.) follows the same pattern:
- `src/pages/<Feature>Page/` — page-level components
- `src/components/<Feature>/` — reusable sub-components (tables, add/update/delete modals)

Forms use React Hook Form + React Select for dropdowns. List views use paginated tables with skeleton loading states (`react-loading-skeleton`). Dialogs/confirmations use SweetAlert2; toasts use React Toastify.

### Tailwind

Custom color tokens are defined in `tailwind.config.js`: `blueColor`, `successColor`, `primaryColor`, `yellowColor`, `purpleColor`, etc. Use these instead of raw Tailwind colors. Active plugins: `tailwind-scrollbar`, `tailwindcss-motion`.

### Static Data

Bangladesh-specific location data (divisions, districts, cities) lives in `src/data/`. Permission role data is in `src/data/permissionData.js`.
