#!/bin/bash
# configure-ios.sh
# Run this ONCE after `npx cap add ios` to:
#   1. Add HealthKit usage descriptions to Info.plist
#   2. Create the App.entitlements file with the HealthKit entitlement
#
# Usage:
#   bash scripts/configure-ios.sh
#
# After this script, open Xcode and manually add the HealthKit capability:
#   App target → Signing & Capabilities → + Capability → HealthKit

set -e

INFOPLIST="ios/App/App/Info.plist"
ENTITLEMENTS="ios/App/App/App.entitlements"

# ── Validate ──────────────────────────────────────────────────────────────────

if [ ! -f "$INFOPLIST" ]; then
  echo "❌  iOS project not found at $INFOPLIST"
  echo "   Run 'npx cap add ios' first, then re-run this script."
  exit 1
fi

echo "📋  Configuring iOS project for HealthKit..."
echo ""

# ── Info.plist — usage descriptions ──────────────────────────────────────────

echo "→  Adding HealthKit usage descriptions to Info.plist..."

# Try -replace first (key already exists), fall back to -insert
add_plist_key() {
  local key="$1"
  local value="$2"
  plutil -replace "$key" -string "$value" "$INFOPLIST" 2>/dev/null \
    || plutil -insert "$key" -string "$value" "$INFOPLIST"
}

add_plist_key \
  "NSHealthShareUsageDescription" \
  "Lift Tracker reads your step count and body weight to help you track fitness progress alongside your workouts."

add_plist_key \
  "NSHealthUpdateUsageDescription" \
  "Lift Tracker saves your completed workouts to the Health app."

add_plist_key \
  "NSHealthClinicalHealthRecordsShareUsageDescription" \
  ""

echo "   ✓ Info.plist updated"

# ── App.entitlements — HealthKit entitlement ──────────────────────────────────

echo "→  Writing App.entitlements..."

if [ -f "$ENTITLEMENTS" ]; then
  # Add key if not already present
  if ! plutil -extract "com.apple.developer.healthkit" raw "$ENTITLEMENTS" &>/dev/null; then
    plutil -insert "com.apple.developer.healthkit" -bool true "$ENTITLEMENTS"
    echo "   ✓ HealthKit entitlement added to existing file"
  else
    echo "   ✓ HealthKit entitlement already present (skipped)"
  fi
else
  cat > "$ENTITLEMENTS" << 'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.developer.healthkit</key>
    <true/>
    <key>com.apple.developer.healthkit.access</key>
    <array/>
</dict>
</plist>
PLIST
  echo "   ✓ App.entitlements created"
fi

# ── Done ──────────────────────────────────────────────────────────────────────

echo ""
echo "✅  Automated configuration complete."
echo ""
echo "⚠️  ONE MANUAL STEP REMAINING — must be done in Xcode:"
echo ""
echo "   1. Run: npx cap open ios"
echo "   2. In Xcode: click 'App' in the left sidebar (top item)"
echo "   3. Select the 'App' target → 'Signing & Capabilities' tab"
echo "   4. Click '+ Capability' → search 'HealthKit' → double-click to add"
echo "   5. Select your Team (Apple Developer account) for signing"
echo "   6. Build and run with ▶️"
echo ""
echo "   Then in your iOS Simulator or device:"
echo "   • Open the Health app and add some mock data (steps, weight)"
echo "   • Launch Lift Tracker → grant permissions when prompted"
echo ""
