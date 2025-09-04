## DABubble — Team Chat (Frontend Portfolio)

An Angular-based, Slack-like chat application built as a junior frontend portfolio project. It demonstrates real‑time messaging with channels and direct messages, threaded replies, emoji reactions, authentication (email/password and Google), and a responsive, animated UI.

This repository intentionally focuses on frontend concerns. Some responsibilities that typically live in a backend are handled in the client for demonstration and learning purposes; details below.

### Tech Stack

- Angular 19 (Standalone Components, Signals `signal/computed/effect`, DestroyRef)
- TypeScript, SCSS
- Firebase via `@angular/fire`: Auth, Firestore (real‑time snapshots)
- Angular Router with `@angular/fire/auth-guard`
- Reactive Forms, Angular Animations
- Linting: `angular-eslint` + `eslint`

### Core Features

- Authentication
  - Register, Login, Logout, Password reset
  - Google OAuth login
- Channels
  - Create channels, update name/description
  - Join/leave (client‑side membership handling)
- Messaging
  - Channel messages with threads (parent/child linkage)
  - Direct messages (1:1) with threads
  - Emoji reactions with per‑user toggling
- Users
  - Profile basics and online indicator via heartbeat (client updates a timestamp)
  - User lists and filtering
- UI/UX
  - Responsive layout with explicit breakpoints (XS–XXL)
  - Animated panels (Workspace/Thread) and interaction hints
  - Search bar and profile menu

### Project Structure (excerpt)

- `src/app/components`
  - `auth/` (login, register, reset-password)
  - `main/` (workspace, channel/direct messages, thread, shared message UI)
  - `legal/` (imprint, privacy policy)
- `src/app/services`
  - `auth.service.ts`, `user.service.ts`, `channel.service.ts`
  - `channel-message.service.ts`, `direct-message.service.ts`
  - `site-animations.service.ts`, `filter.service.ts`
- `src/app/interfaces` — Typed data models (UserProfile, Channel, Messages, Reaction)
- `src/environments/` — Firebase configuration

### Local Development

Prerequisites
- Node.js (LTS recommended) and Angular CLI installed globally (`npm i -g @angular/cli`).

Setup
- `npm install`
- Configure Firebase in `src/environments/environment(.development).ts`.

Run
- `npm start` (or `ng serve`) and open `http://localhost:4200/`.

Quality
- Tests: `npm test`
- Lint: `npm run lint`
- Build: `npm run build`

### Architecture Notes

- State management: Angular Signals are used for UI state and derived values (`signal`, `computed`, `effect`).
- Data access: Firestore collections are encapsulated in services; real‑time updates via `onSnapshot` update reactive signals.
- Routing and guards: Unauthorized users are redirected to `login`; authenticated users access `main` with nested routes for channels and direct messages.
- Forms and validation: Reactive Forms with clear validators and mapped error messages (e.g., Firebase auth codes → user‑friendly messages).

---

## What Went Well

- Clear separation of concerns: Data access logic in services; presentational and container concerns in components.
- Modern Angular patterns: Standalone components, Signals/Computed/Effects, and proper cleanup via `DestroyRef`.
- Real‑time experience: Firestore snapshot subscriptions keep channels, messages, and online indicators up to date.
- Solid form validation: Regex‑based email validation and explicit auth error mapping improve UX.
- Strong typing: Well‑defined interfaces for channels, messages, users, and reactions.
- Responsive design: Custom SCSS breakpoints and straightforward responsive rendering for desktop, tablet, and mobile.
- Route protection: `@angular/fire/auth-guard` secures private routes.

## Learnings / Improvements for the Next Project

- Increase test coverage
  - Add unit tests for services (reactions toggle, thread filtering, heartbeat) and components (form validation, route state handling).
  - Add integration tests for guards and critical real‑time data flows.

- Centralize shared logic (DRY)
  - Reaction toggling is duplicated across channel and direct messages; extract to a shared utility/service.
  - Thread helpers can be unified to reduce branching in components.

- Robust error handling and user feedback
  - Replace console logs with consistent UI feedback (toasts/alerts), define retry strategies, and show empty states when data isn’t available.

- Security and data rules (document and enforce)
  - Client currently checks membership and ownership. In production, Firestore Security Rules (and possibly Cloud Functions) should enforce:
    - Only channel members can read/write channel messages
    - Rate limits / write constraints
    - Field validation and server‑side timestamps
  - Document the rules and include them (or a sample) in the repo.

- Configuration hygiene
  - Firebase API keys are public by design, but document environment handling clearly and avoid committing any sensitive non‑public config.

- CI/CD and tooling
  - Add GitHub Actions for lint/test/build. Optionally add Prettier and commit hooks to keep formatting consistent.

- Accessibility (a11y)
  - Improve keyboard navigation, focus styles, and ARIA attributes; ensure buttons/links use correct semantics.

- Internationalization (i18n)
  - Externalize strings and integrate Angular i18n or Transloco to support multiple locales.

- Template readability
  - Break up very large templates (e.g., complex `@if` blocks in the main layout) into smaller components for maintainability.

- Deployment clarity
  - `firebase.json` is currently empty; add hosting configuration and a short deploy guide or scripts.

## Backend‑like Responsibilities in the Frontend (By Design for This Portfolio)

Because this is a frontend‑focused project, some responsibilities that would usually live on the backend are implemented client‑side to demonstrate UI/UX and real‑time behavior:

- Online presence via heartbeat: The client periodically updates a Firestore timestamp to indicate online status.
- Reactions and thread linkage: The client performs reaction toggling and parent/child message associations.
- Membership checks: Channel membership is checked in the client when rendering or enabling actions.

In a production setup, Firestore Security Rules and optional Cloud Functions would validate and enforce these rules server‑side to ensure data integrity and security.

## Roadmap / Next Steps

- Add comprehensive tests and CI
- Refactor shared reaction/thread logic
- Define and document Firestore Security Rules
- Improve a11y and i18n
- Clarify deployment (Firebase Hosting config) and environment setup

## Getting Started Quickly

1) Install dependencies: `npm install`
2) Provide Firebase config in `src/environments/`
3) Run the app: `npm start`
4) Optional: `npm run lint` and `npm test`

---

If you are reviewing this portfolio project: the points under “Learnings / Improvements” reflect areas I’m actively aware of and plan to improve in the next iteration. This project’s scope was intentionally frontend‑centric; security rules, server‑side validations, and CI/CD will be prioritized moving forward.

