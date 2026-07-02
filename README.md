# Notion Static Site

Pure HTML/CSS/JS — no React, no Tailwind, no build step.

## Deploy
Upload the entire folder to any static host (Netlify, Cloudflare Pages,
GitHub Pages, S3, nginx, etc.). Or preview locally:

```
python3 -m http.server 8080
```

Then open http://localhost:8080

## LocalStorage (User Preferences)

This project uses the **browser's `localStorage` API** to remember user
choices across pages and browser sessions. There are **two persistent
keys**:

| Key          | Values       | Purpose                                              | When set                                           |
|--------------|--------------|------------------------------------------------------|--------------------------------------------------|
| `site-theme` | `"light"` or `"dark"` | Remembers the user's dark-mode preference | When `.theme-toggle` button is clicked           |
| `site-lang`  | `"en"` or `"kh"` | Remembers the user's language choice (English or Khmer) | When `.lang-toggle` button is clicked            |

### How it works

**On first visit:**
- `site-theme` doesn't exist → `theme.js` falls back to the OS
  preference (`prefers-color-scheme: dark` in system settings) and uses
  that value.
- `site-lang` doesn't exist → defaults to `"en"` (English).

**On every page load:**
1. The inline `<head>` script (before paint) reads both keys and applies
   them to `<html>` immediately (no flash).
2. `theme.js` and `i18n.js` (loaded at the bottom of `<body>`) read
   these same keys and wire up the toggle buttons.

**When user clicks a toggle:**
- New value is stored in `localStorage` and applied live to the page.
- Next page load reads the stored value again (seamless persistence).

**On the dashboard:**
- There is a **third key**, `dash-plan` (stores `"free"`, `"pro"`, or
  `"team"`), **but it is explicitly cleared on every dashboard load**
  (line 28 of `plans.js`). This means the plan-preview switcher works
  during a single session but resets to "Free" on any refresh or new
  visit.

### Why localStorage?

- **No server/database** — since this is a static site, we can't persist
  to a backend.
- **Works offline** — preferences are stored on the device itself.
- **Survives browser closes** — unlike session variables that vanish on
  close, `localStorage` is permanent until explicitly cleared.
- **No network overhead** — reads/writes are instant, no HTTP round trips.

### Example

```javascript
// User visits the site for the first time in dark mode.
// OS has prefers-color-scheme: dark, so theme.js detects that
// and sets data-theme="dark" on <html> (no storage entry yet).

// User clicks the sun icon to switch to light mode.
// theme.js runs:
localStorage.setItem('site-theme', 'light');
// Page re-renders with data-theme="light".

// User leaves the site and comes back tomorrow.
// The inline <head> script reads localStorage['site-theme'] = 'light'
// and sets data-theme="light" BEFORE the page even paints.
// No flash; it just loads as light mode.
```

## Structure
- `index.html` — marketing landing page (hero, features, solutions, pricing, download, footer)
- `dashboard.html` — in-app workspace dashboard, with a Free / Pro / Team plan demo switcher
- `login.html` — log in (email/password + social login buttons)
- `signup.html` — create account
- `forgot.html` — forgot password
- `reset.html` — set a new password
- `contact.html` — contact sales form
- `404.html`, `notfound.html` — not-found fallback pages
- `google87771f37347225bd.html` — Google Search Console site-verification file
- `settings.json` — local editor config (Live Server port)

- `saas/` — shared static assets referenced by every page via `/saas/...`:
  - `styles.css` — core design system (tokens, layout, components)
  - `polish.css` — additive visual/a11y polish layered on top of `styles.css`
  - `theme.js` — light/dark mode toggle (persists to `localStorage`)
  - `i18n.js` — EN / KH language switcher (persists to `localStorage`)
  - `nav.js` — mobile nav drawer behavior
  - `forms.js` — auth/contact form submit handling (prototype, no backend)
  - `plans.js` — dashboard plan-preview switcher (Free/Pro/Team, session-only)
  - `favicon.svg`, fonts, and images (e.g. `dashboard-light.png`)

- `_redirects` — pretty-URL rules for Netlify / Cloudflare Pages (if present)

## How It Works (Project Roadmap)

This is a fully static, client-only prototype: there is no server, no
database, and no build step. Every "dynamic" behavior (auth, theming,
language, plan tiers) is simulated in the browser with vanilla JS and
plain `<a href="...">` navigation between pre-rendered HTML pages.

### 1. Page flow (how a visitor moves through the site)

```
                    ┌─────────────┐
                    │ index.html  │  (marketing site)
                    └──────┬──────┘
           ┌───────────────┼────────────────┐
           ▼                                ▼
     ┌───────────┐                   ┌─────────────┐
     │ signup.html│                  │  login.html  │
     └─────┬──────┘                  └──────┬───────┘
           │                                │
           │        ┌───────────────────────┼──────────┐
           │        ▼                       ▼          │
           │  forgot.html ──► reset.html ──►┘           │
           │                                            │
           └───────────────────┬────────────────────────┘
                                ▼
                        dashboard.html
                                │
                        (logout / back)
                                ▼
                          index.html

  contact.html  — reachable from nav/footer "Enterprise" / "Contact sales"
  404.html /
  notfound.html — fallback for any unmatched route
```

Every form's `action="…"` attribute points at the next page in this
diagram (e.g. `login.html` → `dashboard.html`, `forgot.html` →
`reset.html`, `reset.html` → `login.html`). Social-login buttons
(Google/Apple/GitHub) and template submit buttons skip validation and
link straight to `dashboard.html`, since there's no real OAuth or
backend to call.

### 2. Per-page boot sequence

Every HTML page follows the same load order:

1. **Inline `<head>` script (theme flash guard)** — runs before first
   paint. Reads `theme` / `lang` from `localStorage` and sets
   `data-theme` / `lang` on `<html>` immediately, so the page never
   flashes the wrong theme or language before the full scripts load.
2. **`styles.css`** — design tokens + base component styles.
3. **`polish.css`** — layered on top; contrast fixes, hover motion,
   animation, and structural refinements. Never edits `styles.css`
   directly, only overrides/extends it.
4. **Page markup** — every translatable string carries both
   `data-en="…"` and `data-kh="…"`; inputs that need a translated
   placeholder add `data-i18n-attr="placeholder"`.
5. **`i18n.js`** → **`theme.js`** → page-specific script(s)
   (`forms.js` on auth/contact pages, `nav.js` on marketing pages,
   `plans.js` on the dashboard only), loaded at the bottom of `<body>`.

### 3. Subsystem breakdown

**Theme switcher (`theme.js`)**
- Single source of truth: `localStorage["site-theme"]` (`"light"` or `"dark"`).
- On load: uses the stored value, or falls back to the OS
  `prefers-color-scheme` if nothing is stored yet.
- Sets `data-theme` on `<html>` (all CSS variables in `styles.css`/
  `polish.css` key off this attribute) and mirrors it to `data-bs-theme`
  for Bootstrap compatibility.
- Any element with class `.theme-toggle` is auto-wired via event
  delegation — no per-button listeners needed — and its icon is
  re-rendered (sun ↔ moon) to show the mode you'd switch *to*.

**Language switcher (`i18n.js`)**
- Single source of truth: `localStorage["site-lang"]` (`"en"` or `"kh"`).
- `translate(lang)` walks every `[data-en]`/`[data-kh]` element and
  swaps its `textContent` (or the attribute named in
  `data-i18n-attr`) to the matching string — no page reload.
- Also sets `<html lang="en|km">` so `styles.css`'s
  `html[lang="km"] body { font-family: 'Noto Sans Khmer', … }` rule
  picks the right font stack.
- `.lang-toggle` buttons render an inline SVG flag + EN/KH label for
  the *current* language and flip on click, same delegation pattern
  as the theme toggle.

**Form handling (`forms.js`)**
- All `form.auth-form` elements (login, signup, forgot, reset,
  contact) use `action="…" method="get"` for graceful no-JS
  degradation, but `forms.js` intercepts `submit`, calls
  `reportValidity()` to run native HTML validation
  (`required`/`pattern`/`minlength`), and only navigates on success.
- Navigation is done via `window.location.assign(action)` instead of
  letting the native GET submission fire, so field values (including
  passwords) are never serialized into the URL/history.

**Dashboard plan demo (`plans.js` + CSS)**
- `data-plan="free|pro|team"` on `<html>` drives visibility of every
  element tagged `[data-plan-only="free"]` / `"pro"` / `"team"` (CSS
  rule in `styles.css` §25 hides non-matching blocks — no JS
  show/hide, no flash).
- The dashboard **always boots on "Free"** on every load; any stored
  plan from a previous session is explicitly cleared on init.
- The in-page "Preview plan" pill switcher (and any element with
  `[data-plan-set]`, e.g. the sidebar "Upgrade" link) updates
  `data-plan` live, client-side only — nothing persists across a
  refresh.

**Mobile nav drawer (`nav.js`)**
- The drawer itself is pure CSS (a hidden `#nav-toggle` checkbox +
  `:checked` sibling selectors) — `nav.js` only adds the polish CSS
  can't: closing the drawer when a link inside it is tapped, keeping
  `aria-expanded` in sync on the hamburger, moving focus into the
  drawer on open, and closing it on <kbd>Escape</kbd>.

### 4. What's real vs. simulated

| Feature                | Status                                                        |
|-------------------------|----------------------------------------------------------------|
| Page routing            | Real — plain multi-page HTML, no router                       |
| Auth (login/signup)     | Simulated — any "valid" input navigates to `dashboard.html`    |
| Password reset flow     | Simulated — `forgot.html` → `reset.html` → `login.html`        |
| Contact form            | Simulated — no email is actually sent                          |
| Theme (light/dark)      | Real, persisted in `localStorage`                               |
| Language (EN/KH)        | Real, persisted in `localStorage`                                |
| Plan tiers (Free/Pro/Team) | Simulated, dashboard-only, resets to Free every load          |
| Data/analytics on dashboard | Static, hard-coded numbers in the HTML                     |

## Notes
- All pages are static prototypes: forms intercept submission client-side
  and redirect to another page in the flow rather than hitting a real backend.
- Theme and language preferences are stored in `localStorage` and shared
  across pages; the dashboard's plan-preview toggle is session-only and
  always resets to "Free" on reload.
