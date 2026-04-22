# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # install dependencies
npm run dev          # start Vite dev server on port 3000 (host 0.0.0.0)
npm run build        # production build via Vite
npm run preview      # preview the production build
```

No test, lint, or typecheck scripts are configured. The TypeScript compiler runs with `noEmit: true` via `tsconfig.json` — for ad-hoc type checking use `npx tsc --noEmit`.

### Environment

Vite `define` in `vite.config.ts` injects the Gemini API key as both `process.env.API_KEY` and `process.env.GEMINI_API_KEY`, read from `.env.local`:

```
GEMINI_API_KEY=...
```

`FRONTEND-INTEGRATION.md` describes a migration to a backend-brokered OAuth flow where these keys move server-side and the frontend uses `services/authService.ts` + `VITE_BACKEND_URL` / `VITE_FRONTEND_URL` instead. That migration is partially staged (`authService.ts` exists, but `geminiService.ts` still reads `process.env.API_KEY` directly). When editing API call sites, check whether the target file has been migrated before choosing `fetch` vs. `authenticatedFetch`.

## Architecture

This is a React 19 + Vite + TypeScript single-page app — an "AI Content Studio" (UI text in Portuguese) wrapping Google's `@google/genai` SDK for Gemini (`gemini-2.5-pro`, `gemini-2.5-flash-image`) and Veo (`veo-3.1-fast-generate-preview`). Styling is Tailwind via the CDN script in `index.html` (no Tailwind config file / no PostCSS pipeline); the design tokens live as CSS variables inside `index.html`.

### Top-level mode → studio tree

`App.tsx` holds a single `CreationMode` (`'image' | 'video' | 'tools'`) and renders one of three top-level studios. Each studio is itself a switchboard over a sub-mode:

- `components/ImageStudio.tsx` → `flyer | telao | editorial | decupagem` (files in `components/studios/`: `FlyerCreator`, `TelaoCreator`, `EditorialStudio`, `DecupagemStudio`)
- `components/VideoStudio.tsx` → `compositor | dna_extractor | art_director | visualizer_engine | motion_designer | production_pipeline | intelligent_pipeline | b_roll_library | cinema` (with several legacy sub-modes stubbed to "integrated into Production Pipeline")
- `components/ToolsStudio.tsx` → `generate | edit | inpaint | resize | analyze | upscale | copy_pose | extract_style`

All studios are local-state components (`useState`, sometimes `immer.produce`); there is no global store, router, or context — props flow top-down and every studio is self-contained. Large form shapes live as named interfaces in `types.ts` (`FormData`, `TelaoFormData`, `VideoFormData`, `VisualizerEngineFormData`, `MotionDesignerFormData`, `DecupagemFormData`, `FilmmakerFormData`, `TelaoCompositorFormData`, etc.) — add new options there first, then wire them into the corresponding studio.

### API key gating

Video/Veo generation requires a user-selected key via the `window.aistudio` global (provided by the AI Studio host): `App.tsx` probes `window.aistudio.hasSelectedApiKey()`, exposes a header button that calls `openSelectKey()`, and passes `{ apiKeyReady, onSelectKey }` down to studios that need it. `generateVeoVideoFromPrompt` in `geminiService.ts` rechecks this and throws `ApiKeyError` if missing — catch `ApiKeyError` at call sites and trigger `onSelectKey`. Other functions just read `process.env.API_KEY` set by Vite.

### services/geminiService.ts is the single integration boundary

Every studio imports from `services/geminiService.ts`. It contains a mix of:

- **Real Gemini calls** (`editImageWithFlash`, `runSIB`, `runDecoupageEngine`, `generateSingleDecupagemFrame`, `runVideoEngine`, `generateVeoVideoFromPrompt`, `generateTextFromImage`) — these use `getAi()` → `new GoogleGenAI({ apiKey: process.env.API_KEY })` per call.
- **Mock implementations** (`generateVideo`, `generateImageWithImagen`, `generateFlyer`, `generateBackdropImage`, `generateVisualizer`, `analyzeMusicForDNA`, `runFilmmakerPipeline`, and ~20 more) returning hard-coded `MOCK_IMAGE_URL` / `MOCK_VIDEO_URL` via `mockApiCall(data, delay)`. When a feature "works in the UI but looks fake," this is usually why — check whether the function is real or mocked before debugging.

All errors should flow through the classes in `services/errors.ts` (`ApiKeyError`, `SafetyError`, `GenerationError`, `NetworkError`, all extending `GeminiError`); `SAFETY` finish reasons should be mapped to `SafetyError`, and anything containing `"API key not valid"` or `"Requested entity was not found."` should be mapped to `ApiKeyError`.

Decupagem and SIB pipelines rely on **string-parsed Gemini output** with strict delimiters (`===`-bordered `BLOCO 1/2/3`, `CENA X:`, `[CENA X / PLANO X.Y]`, `Decupagem técnica da cena` / `Frames detalhados` / `Super Prompt dos Frames` / `JSON Estrutural Final`). `parseSibResponse`, `parseDecoupageEngineResponse`, and `parseScriptToScenes` in `geminiService.ts` will throw `GenerationError("mal formatada")` if the model drifts — prompts must keep those markers verbatim.

### Other services

- `services/dnaEngine.ts` — lazy-fetches `/flyer_dna_engine.json` (served as a static asset at repo root), exposes `getArtistPresets`, `getEmotionMatrix`, `getCreativeDNA(artistName, emotion)` used by `FlyerCreator`.
- `services/expansionEngine.ts` — pure string helper that builds prompts for image expansion based on an influence slider.
- `services/authService.ts` — OAuth + `authenticatedFetch` helpers described in `FRONTEND-INTEGRATION.md`; **not yet integrated into `App.tsx` or `geminiService.ts`** despite being merged.
- `services/typographyEngine.ts` — empty placeholder.

### data/ is the prompt library

`data/*.ts` and `data/*.json` are large, mostly string-constant modules imported by `geminiService.ts` and the studios to compose prompts: genre/style guides (`DRC_V1_0`, `CME_V1_0`, `RSSE_V1_0`, `CLAFE_V1_0`, `CIME_V1_0`, `WardrobeEngine_V1_0`, `ImageScience_4K_V1_0`, `TrapStyleGuide_v1`, `VFX_Explosions_v1`, `DOC_010`), libraries (`b_roll_library` ~100KB, `prompt_library` ~150KB, `cinema_style_library`, `texture_library`, `environment_library`, `narrative_library`, `lenses_and_composition_library`, `actor_behavior_library`, `context_modifiers`), presets (`vibe_presets`, `trap_style_preset`), and benchmarks (`upscale_benchmarks.json`, `GSM.json`). `scanProfiles.json` / `textureMap.json` exist both at repo root and inside `data/`; the root copies are what gets served at runtime.

### Path aliases

`@/*` → repo root (configured in both `vite.config.ts` `resolve.alias` and `tsconfig.json` `paths`). Most existing imports use relative paths, so match the surrounding file's style.

### Conventions

- All UI copy and most prompt strings are in **Portuguese (pt-BR)** — preserve language when editing.
- Large forms use one `formData` state object + a generic `handleFormChange<T extends keyof FormData>(field, value)` updater; extend that pattern rather than introducing per-field setters.
- `ImageFile` / `AudioFile` carry `base64` alongside `preview`; the `base64` is what gets sent to Gemini `inlineData`, and `preview` is the `URL.createObjectURL` / data-URL for `<img>`.
- Veo long-running ops are polled every 10s (`while (!operation.done)`); the returned URI must be re-fetched with `&key=${API_KEY}` appended and converted to a blob URL — see `generateVeoVideoFromPrompt` for the canonical shape.

## GitHub repo

`pretinhuu1-boop/gerador` — develop on the branch assigned in the task prompt; pushes outside that branch are not permitted.
