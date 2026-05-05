# Lift Tracker — Project Context

## Architecture Documentation

A detailed architecture doc with Mermaid diagrams lives at `ARCHITECTURE.md` in this directory. It covers app flow, module dependency graph, data schema ER diagram, key user workflow flowcharts, progressive overload logic, deployment process, and a change log.

**Keep it in sync.** After any structural code change, update the relevant sections in `ARCHITECTURE.md` and include it in the same commit.

---

## What this is
A personal workout tracking PWA (Progressive Web App) for Reid's 4-day push/pull/legs training split. Built as a modular vanilla JS app with no frameworks. Deployed to GitHub Pages and installed as a home screen app on iOS.

**Live URL:** https://reidrussell-alt.github.io/lifting-tracker-Application/
**Local dev:** `python3 -m http.server 8082 --directory "/Users/reidrussell/Documents/Learning Tools/lift-tracker"`
**Then open:** http://localhost:8082

---

## Project structure

```
lift-tracker/
├── index.html              # Shell — markup only, no inline JS/CSS
├── manifest.json           # PWA manifest
├── service-worker.js       # Cache-first SW; bump CACHE_NAME version on every deploy
├── css/
│   └── main.css            # All styles; CSS variables in :root
└── js/
    ├── app.js              # Entry point — imports everything, binds window.* handlers
    ├── program.js          # Original 4-day split data + extended MUSCLE_GROUPS (no DOM)
    ├── exerciseLibrary.js  # 60+ exercises with id/name/muscleGroup/loadType (no DOM)
    ├── programTemplates.js # 6 program templates using exercise library (no DOM)
    ├── data.js             # localStorage read/write; state (profile, programs, history)
    ├── onboarding.js       # New-user onboarding flow (name, mode, template)
    ├── settings.js         # Settings tab: profile, program management, data backup
    ├── session.js          # Active workout session; structured + track-as-you-go
    ├── plan.js             # Plan tab: reads active program from state.programs
    ├── progress.js         # Progress tab: stats, charts, calendar, edit modal
    ├── charts.js           # Canvas chart drawing utility
    ├── utils.js            # Date helpers, showToast()
    └── welcome.js          # Welcome/splash screen shown on every app open
```

---

## Tech stack
- Vanilla JS with ES modules (`type="module"`)
- No build step, no bundler, no framework
- CSS custom properties for theming
- Canvas API for charts
- localStorage for all data persistence
- Service worker for offline/PWA support

---

## Critical architecture pattern — window bindings

Because `index.html` uses inline `onclick="..."` handlers on dynamically generated HTML, every handler function must be bound to `window` in `app.js`. This is the **only** place window bindings should live.

```js
// app.js — all handlers bound once here
window.startSession = startSession;
window.renderProgress = renderProgress;
// etc.
```

Cross-module calls (e.g. session.js calling switchTab) use `window.switchTab` at runtime — safe because all bindings are set before any user interaction.

---

## Data storage

**Key:** `liftTrackerData` in localStorage
**Schema version:** 3

```js
{
  version: 3,
  profile: {
    name: "Reid",
    createdAt: "2026-05-04T...",
    trainingMode: "structured"   // "structured" | "trackAsYouGo"
  },
  programs: [
    {
      id: "program_default",
      name: "Reid's 4-Day Push/Pull/Legs",
      isActive: true,
      createdAt: "2026-05-04T...",
      days: [
        {
          id: "upperA",
          name: "Upper A - Push",
          type: "push",           // optional, for styling
          exercises: [
            { id: "db_press", name: "Dumbbell Press", sets: 4, loadType: "weight", muscleGroup: "chest" }
          ]
        }
      ]
    }
  ],
  history: [
    {
      programId: "program_default",   // NEW in v3
      programName: "Reid's 4-Day...", // NEW in v3
      dayId: 'upperA',
      dayTitle: 'Upper A - Push',
      date: '2026-04-15T12:00:00.000Z',
      bw: '196',
      exercises: [
        {
          id: 'db_press',
          name: 'Dumbbell Press',
          loadType: 'weight',
          note: '',
          sets: [{ weight: '90', reps: '8', note: '', logged: true }]
        }
      ]
    }
  ]
}
```

**Migration:** `loadData()` auto-migrates v2 → v3: creates default program from program.js, tags history with programId, creates profile `{ name: "Reid", trainingMode: "structured" }`. New users (no localStorage) see onboarding instead.

**Backup/restore:** Export downloads a JSON file; import replaces all history after confirmation.

---

## The 4-day program

Defined in `program.js`. Rotation order: `upperA → lowerA → upperB → lowerB → repeat`.

| dayId   | Title   | Focus           |
|---------|---------|-----------------|
| upperA  | Upper A | Push            |
| lowerA  | Lower A | Quads           |
| upperB  | Upper B | Pull            |
| lowerB  | Lower B | Posterior chain |

`MUSCLE_GROUPS` maps exercise IDs to muscle group keys. `MUSCLE_GROUP_ORDER` controls display order on the Progress tab.

---

## CSS variables (from :root)

```css
--bg: #0a0a0a
--surface: #141414
--surface-2: #1c1c1c
--surface-3: #242424
--border: #262626
--border-bright: #383838
--text: #fafafa
--text-dim: #888
--text-dimmer: #555
--accent: #d4ff3a        /* neon lime — primary accent throughout */
--push: #ff6b35
--pull: #3a9eff
--legs: #d4ff3a
--recovery: #b86bff
--success: #4ade80
```

---

## Key module responsibilities

### `welcome.js`
Splash screen shown on every app open. Tap to dismiss (no auto-dismiss).
- `getGreeting()` — time-based "Good morning/afternoon/evening"
- `getWelcomeWorkoutLabel()` — determines next workout from history rotation; falls back to "TODAY'S SESSION"
- `USER_NAME` constant at top of file — change here to update the name everywhere
- Dismissal: fades out, then removes the element from DOM

### `session.js`
- `getLastPerformance(exerciseId)` — finds most recent session containing that exercise
- `getLastExerciseNote(exerciseId)` — returns last note, with backward-compat fallback to set-level notes
- `getSuggestion(exerciseId, loadType)` — progressive overload suggestion shown during session
- Calls `window.switchTab('plan')` after finishing a session

### `progress.js`
- Module-level `calendarYear` / `calendarMonth` state for calendar navigation
- `renderCalendar()` — private; generates monthly grid with color-coded workout dots
- `WORKOUT_COLORS` — maps dayId to hex color and display label
- `navigateCalendar(dir)` — exported, bound to window, called by calendar arrow buttons

### `data.js`
- `importData()` calls `window.renderPlan()` after import
- `confirmReset()` calls `window.switchTab('plan')` after reset

---

## Service worker

- Cache name must be bumped (v1 → v2 → v3...) on **every deploy** that changes JS/CSS files
- Currently: `lift-tracker-v5`
- SW is **disabled on localhost** — the hostname check in `app.js` prevents re-registration during development
- On iOS, updating the PWA requires deleting the home screen app and re-adding it from Safari

---

## Deployment

```bash
# From the lift-tracker directory:
git add <changed files>
git commit -m "description"
git push origin main
```

- Hosted on GitHub Pages from the `main` branch
- GitHub Pages takes 1–5 minutes to deploy after push
- After deploy, phone users must delete + re-add the home screen app to get new code
- Git remote: `https://github.com/reidrussell-alt/lifting-tracker-Application.git`
- Auth: Personal Access Token required (password auth disabled by GitHub)

---

## Fonts

Loaded from Google Fonts:
- `Archivo Black` — headings, large display text
- `JetBrains Mono` — labels, stats, monospace UI elements
- `Inter Tight` — body, secondary text

---

## Known constraints

- **Preview tool can't serve this project** — the Claude Code preview sandbox lacks filesystem access to `~/Documents`. Always test at `localhost:8082` using the user's own Python server.
- **No build step** — ES module imports use relative paths. No bundling, no transpilation.
- **iOS PWA cache** — service workers on iOS are aggressive. Bumping the SW cache version forces a re-fetch, but the user still needs to delete/re-add the home screen app for changes to take effect immediately.
