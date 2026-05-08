# Capacitor + Apple Health Setup Checklist

Complete these steps in order once Xcode and Node.js are installed.
All code in `js/healthkit.js`, `capacitor.config.json`, and `package.json` is already written and ready.

---

## Prerequisites

- [ ] **Xcode** installed from the Mac App Store (≥ Xcode 15, ~10 GB)
  - Open Xcode once and accept the license agreement
  - Run: `sudo xcode-select --switch /Applications/Xcode.app`
- [ ] **Node.js** installed (`node --version` should print `v20.x` or later)
  - Install via Homebrew: `brew install node`
  - Or download from https://nodejs.org (LTS version)
- [ ] **Apple Developer Account** ($99/year) for real-device testing
  - Free account works for Simulator-only testing
  - Sign in to Xcode → Preferences → Accounts → + → Apple ID

---

## Step 1 — Install npm dependencies

```bash
cd "/Users/reidrussell/Documents/Learning Tools/lift-tracker"
npm install
```

This installs:
- `@capacitor/core` + `@capacitor/cli` — the Capacitor runtime and CLI
- `@capacitor/ios` — the iOS platform package
- `@capacitor-community/health` — the HealthKit native plugin

---

## Step 2 — Add the iOS platform

```bash
npx cap add ios
```

This creates the `ios/` folder with a complete Xcode project. Only run this once.

---

## Step 3 — Auto-configure HealthKit

This script adds the required Info.plist usage descriptions and creates the
entitlements file. Run it from the project root:

```bash
bash scripts/configure-ios.sh
```

Expected output:
```
📋  Configuring iOS project for HealthKit...
→  Adding HealthKit usage descriptions to Info.plist...
   ✓ Info.plist updated
→  Writing App.entitlements...
   ✓ App.entitlements created
✅  Automated configuration complete.
```

---

## Step 4 — Sync web assets to iOS

Run after `npm install` or any time you make code changes:

```bash
npx cap sync ios
```

---

## Step 5 — Open Xcode

```bash
npx cap open ios
```

---

## Step 6 — Enable HealthKit capability in Xcode (MANUAL)

This step cannot be scripted — it must be done in Xcode:

1. In the left sidebar, click the top item: **App** (the blue Xcode project icon)
2. Under **TARGETS**, select **App**
3. Click the **Signing & Capabilities** tab
4. Click **+ Capability** (top-left button)
5. Search for **HealthKit** → double-click to add it
6. Under **Signing**, select your **Team** (your Apple Developer account)

After this step, you should see "HealthKit" listed under capabilities.

---

## Step 7 — Build and run in Simulator

1. At the top of Xcode, select a simulator (e.g., **iPhone 15 Pro**)
2. Click **▶ Run** (or `Cmd+R`)
3. The app builds and launches in the iOS Simulator

**Add mock Health data to the Simulator:**
- Open the **Health** app in the Simulator
- Browse → Activity → Steps → Add Data → enter a step count
- Browse → Body Measurements → Weight → Add Data → enter your weight

**Test the permission flow:**
- Launch Lift Tracker in the Simulator
- You should see the native iOS HealthKit permission dialog
- Tap **Allow All** (or toggle individual items)
- Navigate to Settings tab → Apple Health should show **Connected**

---

## Step 8 — Test on real device (optional, requires paid developer account)

1. Plug in your iPhone via USB
2. In Xcode, change the target at the top from Simulator to your device name
3. Click **▶ Run**
4. First run: go to iPhone → Settings → General → VPN & Device Management → trust your developer account
5. Run again from Xcode

---

## Ongoing development workflow

Every time you edit web files (HTML, CSS, JS):

```bash
npx cap sync ios   # or: npm run sync
npx cap open ios   # then Cmd+R in Xcode
```

For faster iteration, add a live reload server URL to `capacitor.config.json`:

```json
{
  "server": {
    "url": "http://YOUR_MAC_IP:8082",
    "cleartext": true
  }
}
```

Then start the local server and the app will hot-reload without rebuilding:

```bash
python3 -m http.server 8082 --directory "/Users/reidrussell/Documents/Learning Tools/lift-tracker"
```

Remove the `server` block before making a production build.

---

## How the HealthKit code works (no bundler required)

`js/healthkit.js` accesses the native plugin via `window.Capacitor.registerPlugin('Health')`,
which is the global Capacitor bridge injected by the native iOS shell. This means:

- **No bundler or build step is needed** for the web files
- All HealthKit calls are wrapped in `isHealthKitAvailable()` guards
- On the web version (GitHub Pages / Safari PWA), every function is a silent no-op
- The `@capacitor-community/health` Swift plugin is compiled into the iOS app by Xcode

---

## What's already wired up

| Feature | Location | Status |
|---------|----------|--------|
| HealthKit module | `js/healthkit.js` | ✅ Ready |
| Permission request | Settings → Apple Health → Connect | ✅ Ready |
| Toggle steps / weight reads | Settings → Apple Health | ✅ Ready |
| Bodyweight auto-fill | Session start (falls back to Health) | ✅ Ready |
| Today's steps (PROMPT 2) | Progress tab / Plan tab | 🔜 Next |
| Steps on calendar (PROMPT 2) | Progress tab calendar | 🔜 Next |
| Step history chart (PROMPT 2) | Progress tab charts | 🔜 Next |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Module 'Health' not found` in build | Run `npm install && npx cap sync ios` |
| Permission dialog never appears | Delete app from Simulator, rebuild and run |
| No data returned | Add data manually in Health app; check date range in code |
| Build fails: "missing team" | Xcode → Signing & Capabilities → select your Team |
| Web version broken | All HealthKit calls are guarded by `isHealthKitAvailable()` — check that guard |
| `npx cap` not found | Run `npm install` first; or use `./node_modules/.bin/cap` |
