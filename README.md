# AstroVital

AstroVital is a frontend-only astronaut health monitoring dashboard concept. It presents a fictional four-person crew through a restrained aerospace-editorial interface: off-white paper, hairline rules, oversized numerals, and a single signal-orange accent, with a full dark "flight deck" theme.

Everything on screen is generated locally by a deterministic simulation. There is no backend, database, authentication, external API, or real sensor feed.

> **Demo only.** AstroVital is not affiliated with NASA or any space agency. It is not a medical device and must not be used for medical decisions. Risk findings are deterministic threshold rules applied to simulated readings, not machine learning or diagnosis.

## Features

- **Demo login gate** with email/password validation, show/hide password, remember-me persistence, and protected dashboard routes.
- **Simulated telemetry** for four fictional crew members, updating one mission minute every 3.2 seconds.
- **Overview dashboard** with crew-wide vital trends, per-astronaut sparklines, open alerts, system status, and an activity log.
- **Crew monitoring** with search and status filters, roster export, and individual astronaut profiles.
- **Health analytics** across heart rate, SpO₂, temperature, blood pressure, radiation, and sleep, with selectable time windows and crew scope.
- **Rule-based risk analysis** with transparent observations, reference bands, severity scoring, and suggested review actions.
- **Alert workflow** with new → acknowledged → resolved states and toast feedback.
- **Medical history** timeline and telemetry table with CSV export.
- **Notifications** with unread state, mark-all-read, and direct links to the alert center.
- **Simulation controls**: pause/resume, speed, and reset, synchronized across the header and Settings.
- **Light/dark themes** persisted in `localStorage` and synchronized between the header, login screen, and Settings.
- **Sign out** from the header, sidebar, or Settings, clearing the local demo session.
- **Responsive layouts** for desktop, tablet, and mobile, including a mobile navigation drawer.
- **Accessible interaction states**, semantic landmarks, labeled controls, and reduced-motion support.

## Pages

| Route            | Purpose                                                      |
| ---------------- | ------------------------------------------------------------ |
| `/login`         | Demo access gate and mission branding                        |
| `/`              | Mission overview and crew-wide vitals                        |
| `/crew`          | Crew roster, search, status filters, CSV export              |
| `/crew/:id`      | Astronaut profile, telemetry timeline, and medical context   |
| `/analytics`     | Multi-metric trends and comparative statistics               |
| `/risk`          | Rule-based anomaly findings and risk summaries               |
| `/alerts`        | Alert center with acknowledge and resolve actions            |
| `/history`       | Medical event timeline and telemetry history                 |
| `/settings`      | Theme, simulation controls, session, data export, and demo info |

## Tech stack

- React 19 + TypeScript 7
- Vite 8
- React Router 7
- Tailwind CSS 3.4
- Recharts 3
- Zustand 5
- Lucide React icons

## Getting started

Requirements: Node.js 20.19+ or 22.12+ and npm.

```bash
npm install
npm run dev
```

The development server prints a local URL (by default `http://localhost:5173`).

### Scripts

| Command             | Description                                  |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Start the Vite development server            |
| `npm run build`     | Type-check and create a production build     |
| `npm run preview`   | Preview the production build locally         |
| `npm run typecheck` | Run the TypeScript project build             |
| `npm run lint`      | Run ESLint across the source tree            |

Since the dashboard routes are protected by a demo gate, use the credentials displayed on the login screen:

| Field    | Value                   |
| -------- | ----------------------- |
| Email    | `demo@astrovital.space` |
| Password | `artemis-2026`          |

The login form validates empty fields and incorrect credentials, and the “Use credentials” control fills the demo pass automatically. This is a frontend-only demonstration gate, not real authentication or a security boundary.

## Simulation model

- The mission starts at **Day 128, 04:17** (MET).
- Each simulation tick advances the clock by one minute and generates a new reading for every crew member.
- Readings include heart rate, SpO₂, systolic/diastolic pressure, temperature, radiation exposure, and sleep.
- Values drift within plausible bands; occasional episodes intentionally push one metric outside its reference range.
- New readings are appended to a rolling history capped at **90 readings per crew member**.
- Alert episodes can raise simulated alerts; open alerts can be acknowledged or resolved manually.
- Resetting the simulation restores the initial clock, seeded telemetry, alerts, notifications, and activity log.

The simulation runs on the client only. Refreshing the page restarts the in-memory telemetry session but preserves the demo login and theme. The demo session is stored in `localStorage` under `astrovital-demo-session`; when “Remember me” is off, a tab-scoped marker means a new browser session requires signing in again. No real account or credential is transmitted anywhere.

### Simulated reference ranges

| Metric             | Reference band    |
| ------------------ | ----------------- |
| Heart rate         | 50–110 bpm        |
| SpO₂               | 94–100 %          |
| Systolic pressure  | 90–140 mmHg       |
| Diastolic pressure | 55–90 mmHg        |
| Core temperature   | 35.5–37.6 °C      |
| Radiation exposure | ≤ 2.5 mSv/day     |
| Sleep              | ≥ 6.0 h           |

These bands are illustrative demo thresholds, not clinical guidance.

## Project structure

```text
src/
  components/
    auth/        Protected-route wrapper
    charts/      Recharts sparklines, trend charts, risk gauge
    common/      Buttons, panels, badges, inputs, toasts
    crew/        Crew cards, portraits, profile vitals
    dashboard/   Overview-specific widgets
    layout/      App shell, sidebar, header, navigation
  context/       Theme provider, context, and hook
  data/          Fictional crew and seed alerts/notifications
  hooks/         Simulation clock
  pages/         Route-level screens, including login
  services/      Telemetry generation and demo session helpers
  store/         Zustand simulation, UI, and auth stores
  types/         Shared TypeScript types
  utils/         Vitals, risk scoring, series, CSV and formatting helpers
```

## Design notes

- Light theme: `#F7F7F5` paper, `#FFFFFF` surfaces, `#111111` ink, `#707070` muted, `#D8D8D5` rules, `#FF5038` signal.
- Dark theme: `#080D16` background, `#111C2B` surfaces, `#EAF2FA` ink, `#8495A9` muted, `#263548` rules, `#FF5038` signal.
- Typography: Space Grotesk for display, Inter for body, JetBrains Mono for labels and telemetry.
- The interface intentionally favors editorial asymmetry, thin borders, and tabular numerals over glossy dashboard cards.

## Deployment

`npm run build` outputs a static site to `dist/`. Any static host can serve it. Because routes are client-side, configure an SPA fallback that rewrites unknown paths to `index.html` (for example, a Netlify `_redirects` rule or a Vercel rewrite).

The app loads Google Fonts at runtime. If the target environment blocks external requests, the declared system font fallbacks are used.

## Limitations

- All telemetry, alerts, risk scores, and crew biographies are fictional and generated in the browser.
- The login credentials are public demo values. The gate is presentational only and must not be used as real access control.
- State is not shared across tabs or users.
- No automated test suite is included; validation covers TypeScript project checks, ESLint, production build, and browser-based interaction checks.
- The production bundle includes Recharts and is currently emitted as a single client chunk; code splitting is a possible follow-up optimization.

## License

Private demonstration project. All crew names, mission details, and readings are fictional.
