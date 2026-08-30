# Togethr - Frontend 🌍✈️

This repository contains the **Frontend** source code for the **Togethr - Travel Companion Matchmaking System** . This project was developed as part of the 2110423 Software Engineering.

## ✨ Key Features (UI/UX)
Based on the system requirements, the frontend provides interfaces for the following modules:

*   **User Management:** Registration and profile management for both Customers and Providers (including specific provider details like languages spoken and bio) .
*   **Service Discovery:** A robust search and filter interface allowing customers to find services (e.g., photo trips, food tours) based on price, category, rating, and location .
*   **Booking System:** Interfaces for customers to send booking requests and for providers to confirm or reject them .
*   **Payment & Refunds:** Checkout UI for handling 50% deposit payments, final payments, and displaying refund statuses based on cancellation policies .
*   **Communication:** A built-in chat interface for users to communicate after a successful booking .
*   **Review System:** UI for customers to leave 1-5 star ratings and written reviews after a trip .
*   **Support & Admin:** Interfaces for submitting reports/complaints and an admin dashboard for dispute resolution .

## Tech Stack

- **React** + **Vite** (dev server, hot reload)
- **Tailwind CSS v4** (uses `@theme` instead of the traditional config file)

## Folder Structure

```
src/
├── assets/              Images, icons, static files (hero.png, various svgs)
├── components/
│   └── ui/              Reusable base components used across the app (Button, Input, Card, etc.)
│       └── Button.jsx
├── contexts/
│   └── AuthContext.jsx  Global state for login/auth (user, isAuthenticated)
├── hooks/
│   └── useAuth.js       Custom hook for accessing auth data in pages
├── pages/               Actual pages, grouped by user type
│   ├── public/           Pages accessible to everyone (e.g. Login, Home, Landing)
│   ├── customer/         Pages specific to the "customer" role
│   └── provider/         Pages specific to the "provider" role
├── routes/
│   ├── AppRoutes.jsx    All app routes are declared here in one place
│   └── RoleRoute.jsx    Component that checks permissions before allowing access to pages that require login/a matching role
├── services/
│   └── api.js           API call functions (fetch/axios), kept separate from components
├── utils/               General helper functions not tied to UI (date formatting, validation, etc.)
├── App.jsx              Currently unused (main.jsx calls AppRoutes directly)
├── index.css            Design tokens (colors, fonts) + Tailwind import
└── main.jsx             Entry point: wraps the app with AuthProvider and renders AppRoutes
```

### Rules for placing new page files

- Public pages (no login required) → `src/pages/public/`
- Customer-only pages → `src/pages/customer/`
- Provider-only pages → `src/pages/provider/`
- Components reused across multiple pages (buttons, inputs, cards, etc.) → `src/components/ui/`

## Design Tokens (`src/index.css`)

All colors and fonts are declared as variables inside `@theme` so Tailwind can automatically generate utility classes from them. **Never hardcode hex colors directly in component code — always use the classes below instead.**

| Variable | Used as class | Color value | Used for |
|---|---|---|---|
| `--color-primary` | `bg-primary`, `text-primary`, `ring-primary` | `#252A40` | Primary brand color (main buttons, emphasized links) |
| `--color-primary-hover` | `hover:bg-primary-hover` | `#1A1E2D` | Hover state for the primary color |
| `--color-secondary` | `bg-secondary` | `#F3F4F6` | Secondary background, input boxes, inactive tabs |
| `--color-background` | `bg-background` | `#FFFFFF` | Card/page background |
| `--color-text-main` | `text-text-main` | `#333333` | Main body text |
| `--color-text-muted` | `text-text-muted` | `#6B7280` | Secondary text (placeholders, sub-labels) |
| `--font-heading` | `style={{ fontFamily: "var(--font-heading)" }}` | Unbounded | Large headings |
| `--font-body` | Already used as the default for `body` | Inter | General content |

If you need to add a new color, add it to the `@theme` block in `index.css` first, then use it as a Tailwind class across pages so the theme stays consistent throughout the app.

## Running the Project

```bash
npm install       # Install dependencies (only needed once)
npm run dev       # Run the dev server
```

Open the URL shown in the terminal in your browser (usually `http://localhost:5173`)