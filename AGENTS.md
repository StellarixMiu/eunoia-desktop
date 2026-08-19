# AGENTS.md

Tauri 2 desktop app (Vue 3 + Pinia + vue-router + Tailwind v4, Rust backend). Pomodoro timer: main window + per-monitor fullscreen "interrupt" overlay windows. Package manager is **bun** (bun.lock). No tests, no CI. README.md is empty.

## Commands

- `bun run tauri dev` — run desktop app (devUrl is `http://localhost:1420`, port 1420 strict).
- `bun run dev` — Vite web only; Tauri IPC/plugins unavailable here.
- `bun run build` — the verify gate: `lint (--fix) && vue-tsc --noEmit && vite build`. Run this before considering TS work done.
- `bun run lint` — eslint with `--fix`, **mutates files**. Antfu config with formatters (no semicolons).
- `bun run tauri build` — release build.

## State architecture (critical)

Canonical app state lives in Rust, not Pinia:

- `AppState` in `src-tauri/src/state.rs`, created in `lib.rs` `manage()`; persistent keys are loaded/persisted via plugin-store file `stored.json` in setup.rs (`ensure_key`).
- All IPC is string-keyed: `get_u8_state` / `set_u8_state` / `get_u32_state` / `get_bool_state` / `get_string_state`. Every setter emits a `data_changed` event.
- Frontend bridge is `useStorage()` in `src/utils/index.ts`: GETs on mount, writes via watcher, syncs on `data_changed`. Frontend Pinia refs mirror Rust keys — keep keys identical on both sides.
- Router guard (`src/router/index.ts`) does a one-time bulk `loadTauriState` on first open.
- **Gotcha:** only `set_u8_state` persists to disk. `set_u32_state`, `set_bool_state`, `set_string_state` are in-memory only — timer values reset on restart. Don't rely on `total_second`/`is_running` surviving relaunch.
- New commands must be registered in `invoke_handler` (`src-tauri/src/lib.rs:178`).

## Windows & capabilities

- Main window: fixed 500×500, transparent, frameless (`decorations: false`). Drag via `data-tauri-drag-region` (see `TitleBar.vue`).
- Interrupt overlays: `create_interrupt_window` spawns one window per monitor, label `interrupt_{i}`. In release they're `skip_taskbar` + `always_on_top` + steal focus; in debug these are disabled for sanity.
- Capabilities are per-window-type: `capabilities/default.json` (`main`) vs `capabilities/interrupt.json` (`interrupt_*`). New plugin permission → update the right file.
- `src-tauri/gen/schemas/*` is generated — never edit.
- `src-tauri/src/main.rs` `windows_subsystem` attribute: keep.
- `close` button hides the window; app lives on in the tray (quit via tray menu).

## Frontend conventions

- Path alias `~` → `src` (tsconfig.json + vite.config.ts).
- Tailwind v4, no config file: theme lives in `src/style.css` `@theme` block. Custom palettes: `dark-*`, `light-*`, `soft-blue-*`, `soft-red-*`, `soft-yellow-*`; font utility `font-manrope`.
- State machine: `state` is `'FOCUS' | 'SHORT' | 'LONG' | 'INACTIVE'`. Flow driven by `countdown-end` event from `CountdownTimer.vue` → `HomeView.vue` / `InterruptScreen.vue`.
- Global right-click and Ctrl+R/F5 are blocked in `src/main.ts` — deliberate, keep.
- Rust style: 2-space indent (rustfmt.toml).

<!-- graft:start -->
## Graft — repo context graph

This repo is indexed in `graft/`: small linked markdown nodes that explain each
system and carry exact file:line spans, kept in sync with the code through git.

For ANY task here — understanding how something works, finding where code lives,
or scoping a change — get context from the graph before grepping or opening
source files. Re-ask freely (it's cheap) and reuse literal identifiers you
already have (symbol, error string, file name) as the query. New to this repo?
Run `graft map` first — a token-budgeted orientation (dir clusters, hubs,
hotspots), no LLM, no key.

- Run `graft ask "<your question>" --source` → ranked nodes with the relevant
  code spans inlined (each hit's ≤8-line crux by default; `--full` for whole
  definitions when the crux isn't enough). Match the tool to the task shape:
  for understanding or editing, the top node IS the answer — cite its
  `covers:` file:line spans and edit straight from `--source`. For
  exhaustive tasks ("every occurrence / every caller of this pattern"), ranked
  results are top-N, not complete — run `graft grep "<literal>"` instead
  (exhaustive over indexed files, grouped by enclosing symbol), falling back
  to raw `grep -rn` only for unindexed files.
- `graft skeleton <file>` → every definition's signature + span, ~10× cheaper
  than reading the file; use it to skim an API surface.
- `graft callers <symbol>` gives precomputed, exact edges — who calls this.
  Add `--direction out` for what it calls, or `--depth N` to walk
  transitively for the full blast radius. For structural questions, skip
  ranking and use this directly.
- Or browse: `graft/INDEX.md` lists every node; follow the links.
- Monorepos and folders of multiple repos rank fairly across sub-projects —
  hits carry `[scope/]` labels naming which one they're from. Narrow with
  `graft ask "<task>" --in <scope>/` once you know where you're working.

If a returned span is truncated ("+N more lines"), open the file at that exact
range before finalizing. Only open source files when a node genuinely lacks a
needed detail, and then at the exact file:line the node points to — never
re-read whole files.

After big code changes, refresh the graph with `graft build` (deterministic,
no API key, $0).
<!-- graft:end -->
