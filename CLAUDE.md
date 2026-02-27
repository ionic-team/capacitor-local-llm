## Project Overview
Capacitor Local LLM is a Capacitor plugin that wraps on-device LLM functionality on iOS and Android.
- iOS uses on-device Foundation Models introduced in iOS 26 (a very new API — avoid assumptions about its behavior; prefer checking Apple docs)
- Android uses on-device Gemini Nano via the ML Kit packages
- Web is unsupported — plugin methods should throw a "not implemented" error on Web

## Tech Stack
- This package is a Capacitor plugin, as well as an SPM and CocoaPods package
- Languages: TypeScript, Swift 6, Kotlin
- Framework: Capacitor

## Getting Started
```bash
# Install plugin dependencies
npm install

# Run linters and formatters
npm run lint
npm run fmt

# Build plugin (TypeScript + type definitions)
npm run build

# Verify full build including native projects
npm run verify
```

## Project Structure
```
./
  ios/          - Swift source code for native iOS functionality
  android/      - Kotlin source code for native Android functionality
  src/
    definitions.ts  - Public TypeScript interfaces and types (the plugin API contract)
    web.ts          - Web implementation (unsupported stubs)
    index.ts        - Plugin entry point
  example-app/  - Lightweight Ionic Framework app with simple demos for all plugin features
```

## Plugin Architecture
This plugin follows standard Capacitor conventions:
- Public API is defined in `src/definitions.ts`
- New methods must be added in **all** of the following places or the build will break:
  1. `src/definitions.ts` — TypeScript interface
  2. `src/web.ts` — Web stub (throw `unimplemented()`)
  3. iOS Swift plugin class
  4. Android Kotlin plugin class

## Running the Example App
Note: on-device LLMs cannot run in simulators or emulators — a physical device is required.
```bash
cd example-app
npm install
ionic cap sync
# Then open in Xcode or Android Studio to run on a physical device
```

## Code and Project Conventions
- Prettier, ESLint, and SwiftLint are in use for formatting.
- All TypeScript interfaces, types, and functions intended for public API consumption should be documented using JSDoc comments, including:
  - The version the feature was introduced (`@since`)
  - A one-line usage example
  - Platform availability for platform-exclusive features (e.g., `@platform ios`)
- New functionality should be added for all platforms unless unavailable due to platform limitations. Platform-exclusive features must be noted in documentation.

## Testing
- There are no automated unit tests — verification is done manually via the example app on physical devices.
- When making changes, test on both iOS and Android physical devices before considering work complete.

## Things to Avoid
- Do not attempt to run or test using simulators or emulators — on-device LLMs require physical hardware.
- Avoid adding new dependencies where possible. If a dependency is needed, flag it for review before adding.
- Do not make assumptions about Foundation Models API behavior — it is new in iOS 26 and documentation may be limited.
