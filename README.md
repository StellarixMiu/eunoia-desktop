# eunoia

Focus, break, repeat — a distraction-proof pomodoro desktop app.

![Tauri 2](https://img.shields.io/badge/Tauri-2.5-24C8DB)
![Vue](https://img.shields.io/badge/Vue-3.5-42B883)
![Rust](https://img.shields.io/badge/Rust-1.80+-DEA584)
![bun](https://img.shields.io/badge/bun-latest-FBF0DF)

![main window](docs/assets/main.png)

## Features

- **Pomodoro flow** — cycles through FOCUS → SHORT → LONG states; tap to start, hold to pause.
- **Fullscreen break overlays** — one always-on-top, focus-stealing window per monitor for every break; Alt-Tab and Win keys are blocked while a break is running (Windows).
- **Tray-living app** — a minimal 500×500 frameless main window that drops to the system tray; quit from the tray menu.
- **Adjustable rhythm** — configure session count and focus/break durations in Settings, with sound cues when breaks begin and end.

## Requirements

- [bun](https://bun.sh) 1.x
- [Node.js](https://nodejs.org) 18+
- [Rust](https://rustup.rs) stable + platform prerequisites for [Tauri 2](https://v2.tauri.app/start/prerequisites/)

## Getting started

```bash
git clone https://github.com/StellarixMiu/eunoia-desktop.git
cd eunoia-desktop
bun install
bun tauri build
```

The bundled installer is written to `src-tauri/target/release/bundle/` — run the `.msi` (or NSIS `.exe`) to install the app.

## Scripts

| Command             | Description                                                   |
| ------------------- | ------------------------------------------------------------- |
| `bun tauri dev`     | Run the desktop app in development                            |
| `bun dev`           | Vite web only (no Tauri IPC / plugins)                        |
| `bun build`         | Verify gate: lint, type-check, build bundle                   |
| `bun lint`          | ESLint with `--fix`                                           |
| `bun tauri build`   | Production bundle                                             |
| `bun version:sync`  | Sync version across Cargo.toml, package.json, tauri.conf.json |
| `bun version:check` | Verify versions are in sync                                   |
| `bun version:bump`  | Bump the app version                                          |

## Releasing

Pushing a `x.y.z` tag triggers the release workflow: it builds and publishes a GitHub Release with installers.

```bash
bun run version:bump [patch|minor|major]   # default patch, syncs all version files
git add -A
git commit -m "release: v0.2.0"
git push origin master
git tag 0.2.0
git push origin 0.2.0                      # workflow builds, publishes auto-release
```
