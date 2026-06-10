# TrimTV

A personal Android TV streaming app built on the open-source Vega foundation.  
Bring your own provider extensions — no content is bundled.

---

## What's included

| Area | Details |
|---|---|
| **src/** | All React Native source code (screens, components, hooks, stores) |
| **assets/** | App icons, adaptive icon, bootsplash, TV banner |
| **plugins/** | Expo config plugins (TV flags, signing, notifications…) |
| **app.config.js** | Expo app configuration — all branding + Android TV flags live here |
| **package.json** | Dependencies |
| **babel.config.js / metro.config.js** | Build tooling |
| **tailwind.config.js** | NativeWind (Tailwind for RN) config |

---

## Expo & React Native — quick primer

**React Native** lets you write mobile apps in JavaScript/TypeScript using React.  
**Expo** is a toolchain on top of React Native that handles native builds, OTA updates, and config plugins so you rarely touch Java/Kotlin directly.

```
Your TypeScript code
       │
       ▼
  Metro bundler  ──►  JS bundle  ──►  Hermes engine (on-device)
       │
       ▼
  Expo prebuild  ──►  android/  ──►  Gradle  ──►  APK / AAB
```

Key files you'll touch:
- `app.config.js` — app name, package ID, icons, permissions, TV flags
- `src/` — all your screen and component code
- `plugins/` — one-time native patches (you rarely edit these)

---

## How to build TrimTV

### Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | ≥ 18 | https://nodejs.org |
| npm | ≥ 9 | bundled with Node |
| Java (JDK) | 17 | https://adoptium.net |
| Android SDK | API 24+ | via Android Studio |
| Expo CLI | latest | `npm i -g expo-cli` (optional — `npx expo` also works) |

> **Tip:** Set `ANDROID_HOME` and add `$ANDROID_HOME/platform-tools` to your `PATH`.

---

### Step 1 — Install dependencies

```bash
cd TrimTV
npm install
```

---

### Step 2 — Prebuild (generate the `android/` folder)

This is the Expo-specific step that turns your JS config into native Android files.  
Run it once (or again whenever you change `app.config.js`):

```bash
npx expo prebuild --platform android --clean
```

What it does:
- Creates `android/` with `build.gradle`, `AndroidManifest.xml`, etc.
- Applies `isTV: true` → enables Android TV mode
- Adds the Leanback launcher intent filter → your app appears on the TV home screen
- Sets package ID `com.trimtv` and the TV banner asset

---

### Step 3 — Run on a device / emulator

```bash
# Run on a connected Android TV device or emulator
npx expo run:android

# Or if you already have android/ generated and just want the Gradle build:
cd android && ./gradlew assembleDebug
```

The debug APK lands at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

---

### Step 4 — Sideload to Android TV

```bash
# Connect over ADB (WiFi or USB)
adb connect <YOUR_TV_IP>:5555

# Install
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

Your app will now appear in the **Apps** row of the TV launcher.

---

### Release build (optional)

1. Generate a keystore: `keytool -genkey -v -keystore trimtv.jks -alias trimtv -keyalg RSA -keysize 2048 -validity 10000`
2. Add signing config to `android/app/build.gradle`
3. Build: `cd android && ./gradlew assembleRelease`

---

## App icons

Replace these files **before** running prebuild:

| File | Size | Purpose |
|---|---|---|
| `assets/icon.png` | 1024 × 1024 | Standard launcher icon |
| `assets/adaptive_icon.png` | 1024 × 1024 | Adaptive icon foreground (Android 8+) |
| `assets/tv_banner.png` | **320 × 180** | Android TV home-screen banner |
| `assets/bootsplash/` | various | Splash screen assets |

> The TV banner is what users see on the TV launcher row — make it look good!

---

## Adding providers / extensions

1. Open TrimTV on your device.
2. Go to **Settings → Extensions**.
3. Paste the URL of a compatible provider JS file and tap **Add**.

The extension system downloads and evaluates the JS module at runtime  
— no source code changes needed.

---

## School Mode (new feature)

Found in **Settings → School Mode**:

- **Study Focus Mode** — toggle that surfaces a focus reminder
- **Pomodoro Timer** — in-app countdown (10 / 15 / 25 / 30 / 45 / 60 min presets)
- **Session Counter** — tracks completed study sessions per day (auto-resets at midnight)
- **Study Reminder** — schedules a local notification after N minutes to remind you to study

---

## Android TV D-pad mapping

| Button | Action |
|---|---|
| D-pad Left / Rewind | Seek back 10 s |
| D-pad Right / Fast-Forward | Seek forward 10 s |
| OK / Centre | Toggle player controls |
| D-pad Up | Show controls |
| D-pad Down | Hide controls |
| Play / Pause | Toggle controls |
| Back | Exit player |

---

## Key changes from Vega upstream

| Area | Change |
|---|---|
| Name / package | `Vega` → `TrimTV`, `com.vega` → `com.trimtv` |
| Version | `3.4.0 (165)` → `1.0.0 (1)` |
| Download folder | `/vega` → `/trimtv` |
| TV support | `isTV: true`, TV banner, LEANBACK launcher, D-pad handler |
| Hero UI | Dual gradient, genre pills, themed Play + Info buttons, TrimTV wordmark |
| Slider UI | Larger cards (120 × 178), accent bar header, "See all" pill |
| About screen | Removed Vega GitHub API; clean TrimTV info + legal notice |
| Onboarding | Rebranded Tutorial with step-by-step guide and TrimTV mark |
| School Mode | New screen — timer, reminder, session counter, study tips |
| Cleaned up | Removed `.github/`, `fastlane/`, `__tests__/`, `scripts/`, `eas.json` |

---

## Disclaimer

TrimTV does not host, store, or provide any media content.  
All content is sourced by the user via third-party provider extensions.
