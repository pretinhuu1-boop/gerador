# Button Asset Map: The Crew Running

**Purpose:** map every planned command/button family before generating the UI button sprite sheet.
**Visual source:** `DESIGN.md`, `GAME_UI_TEMPLATE.md`, `IMPLEMENTATION_ORCHESTRATION_PLAN.md`, current `components/launch/*` and `components/*`.
**Production rule:** button text stays live in React/CSS for accessibility, localization, responsiveness and exact spelling. Bitmap assets should provide frames, textures, decals, states and button materials.

## 1. Button Families

| Family | Role | Visual Treatment | Current Classes |
| --- | --- | --- | --- |
| Primary command | Main progression action | safety-orange sticker slab, rough black offset shadow, cream ink border, active cyan edge | `btn-solid`, `game-command--primary` |
| Secondary command | Back, edit, randomize, non-primary action | chalk/cream rough outline over charcoal, orange or cyan corner tape | `btn-chalk`, `game-command` |
| Skip/link command | Skip, menu, replay and dev entry | small torn tape or underlined text chip, low chrome | `launch-skip`, `btn-link`, `main-menu__nav-link` |
| Navigation slab | Main menu sections | vertical asphalt tabs, active crew accent strip, selected rough border | `main-menu__nav-item` |
| Crew selector | Select active crew | patch/ticket tile using crew badge, active spray border, inactive fogged edge | `CrewPilotPreview` buttons |
| Runner type selector | Select runner energy/profile | compact ticket tile, selected sticker corner, rough focus ring | `runner-creator__type-card` |
| Wardrobe/equipment tile | Select locked clothing item | square equipment slot, selected latch/sticker, disabled/empty chalk mark | `runner-creator__wardrobe-tile` |
| Upload zone | Add selfie | large dashed mission slot with plus mark, camera/runner ID energy | `upload-zone`, `runner-creator__selfie-empty` |
| Variant hit zone | Equip generated look | invisible hit area plus mini command callout | `runner-creator__variant-zone`, `game-command--mini` |
| State chip | Non-clickable status | small tape label, monospaced text, cyan/yellow/orange variants | `signal-chip` |
| Sticker stamp | Completion/reward state | rough sticker stamp over ticket, crew sticker/achievement support | `sticker-stamp` |
| Dev/studio control | Hidden studio settings | small low-emphasis tape/link, not primary visual surface | `runner-creator__dev`, studio modal buttons |

## 2. Planned Button Inventory

### Launch / Intro

| Label | Screen | Family | State Needs | Notes |
| --- | --- | --- | --- | --- |
| `PULAR` | `ConsoleBoot` | Skip/link command | default, focus, pressed | Skips boot only. Small corner tape. |
| `PULAR INTRO` | `TitleScreen`, `CitySignalEntry` | Skip/link command | default, focus, pressed | Skips title/city intro to HQ/guide, not direct run. |
| `ENTRAR` | `TitleScreen` | Primary command | default, hover, pressed, focus | First title-screen action. Should feel like press start. |
| `COMEÇAR` | `CitySignalEntry`, `MainMenu` | Primary command | default, hover, pressed, focus | Enters HQ or starts guided setup. |
| `CREWS DA CIDADE` | `CitySignalEntry` | Section command/chip | static header, optional focus if made button | Treat as crew-list sign, not CTA. |

### Main Menu / HQ

| Label | Screen | Family | State Needs | Notes |
| --- | --- | --- | --- | --- |
| `INÍCIO` | `MainMenu` | Navigation slab | inactive, active, hover, focus | Active state needs strong selector slab. |
| `CREWS PILOTO` | `MainMenu` | Navigation slab | inactive, active, hover, focus | Opens crew preview panel. |
| `RUNNER` | `MainMenu` | Navigation slab | inactive, hover, focus | Goes to guide or creator depending progress. |
| `CONFIG` | `MainMenu` | Navigation slab | inactive, active, hover, focus | Safety/privacy panel. |
| `REVER INTRO` | `MainMenu` | Skip/link command | default, hover, focus | Low emphasis, but discoverable. |
| `MONTAR RUNNER` | `MainMenu` | Primary command | default, hover, pressed, focus | After setup but before saved runner. |
| `AJUSTAR RUNNER` | `MainMenu`, `RunnerSavedTeaser` | Secondary command | default, hover, pressed, focus | Edit identity after saved state. |

### Guided Setup

| Label | Screen | Family | State Needs | Notes |
| --- | --- | --- | --- | --- |
| `PULAR TUTORIAL` | `GuidedOnboarding` | Skip/link command | default, focus, pressed | Goes to runner creator and marks setup complete. |
| `MENU` | `GuidedOnboarding`, `RunnerSavedTeaser` | Skip/link command | default, hover, focus | Back to HQ. |
| `VOLTAR` | `GuidedOnboarding`, API modal | Secondary command | default, disabled, focus, pressed | Guided setup back can be disabled at step 1. |
| `PRÓXIMO` | `GuidedOnboarding` | Primary command | default, hover, pressed, focus | Advances one mission step. |
| `CRIAR RUNNER` | `GuidedOnboarding`, `RunnerCreator` | Primary command | default, disabled, loading, focus, pressed | Final guide CTA and creator generation CTA. |

### Runner Creator

| Label | Screen | Family | State Needs | Notes |
| --- | --- | --- | --- | --- |
| `VOLTAR AO SINAL` | `RunnerCreator`, `RunnerSavedTeaser` | Primary or skip/link depending placement | default, hover, pressed, focus | In saved teaser it can be primary. In creator header it is link. |
| `ESTÚDIO` | `RunnerCreator` | Dev/studio control | default, focus, pressed | Hidden-ish studio settings, not primary player action. |
| `AJUSTE` | `RunnerCreator` | Dev/studio control | default, focus, pressed | Appears when key exists; should not look like core gameplay. |
| `ENVIAR SELFIE` | `PhotoUpload` | Upload zone | empty, hover, focus, filled | Large equipment slot, not regular CTA. |
| `REMOVER` | `PhotoUpload` | Skip/link command | default, hover, focus | Small destructive-ish utility, low emphasis. |
| runner type labels | `RunnerTypePicker` | Runner type selector | inactive, selected, hover, focus | Labels come from `data/runnerTypes.ts`; collective option must remain `Crew Flow` / `crew-flow`. |
| wardrobe items | `WardrobePicker` | Wardrobe/equipment tile | inactive, selected, hover, focus, fallback | Labels/icons come from `data/wardrobe.ts`. |
| `MISTURAR LOOK` | `RunnerCreator` | Secondary command | default, hover, pressed, focus | Replaces `RANDOM`. |
| `CRIAR RUNNER` | `RunnerCreator` | Primary command | default, disabled, loading, focus, pressed | Replaces `GERAR`. |
| `CREW STUDIO...` | `RunnerCreator` | Loading state | loading | Loading label for `CRIAR RUNNER`. |
| `EQUIPAR` | `SheetPreview` | Variant hit zone mini command | default, hover, focus, pressed | Small overlay callout on generated sheet variants. |
| `SALVAR` | Studio modal | Secondary/dev command | default, disabled, focus | Dev modal only, not player-facing primary flow. |

### Saved / Ready State

| Label | Screen | Family | State Needs | Notes |
| --- | --- | --- | --- | --- |
| `RUNNER READY` | `RunnerSavedTeaser` | Sticker stamp | stamped, static | Not a button; should exist in sprite/sticker sheet. |
| `CIDADE PRONTA` | `RunnerSavedTeaser` | State chip/stamp | static | Status label, not command. |
| `VOLTAR AO SINAL` | `RunnerSavedTeaser` | Primary command | default, hover, pressed, focus | Returns to HQ. |
| `AJUSTAR RUNNER` | `RunnerSavedTeaser` | Secondary command | default, hover, pressed, focus | Returns to creator. |

## 3. Sprite Sheet Layout

Generate one atlas that acts like a character sheet for button materials. Keep all button art textless.

Recommended grid: 6 columns x 6 rows.

| Cell Range | Contents |
| --- | --- |
| A1-F1 | Primary command frames: default, hover, pressed, focus, disabled, loading |
| A2-F2 | Secondary chalk frames: default, hover, pressed, focus, disabled, compact |
| A3-F3 | Skip/link tape frames: top-right tape, underline tape, small menu strip, replay strip, dev strip, remove strip |
| A4-F4 | Navigation slabs: inactive, active, hover, focus, runner active, config active |
| A5-F5 | Selector tiles: crew tile, crew active, style tile, style selected, wardrobe tile, wardrobe selected |
| A6-F6 | Utility/status materials: upload slot, mini callout, signal chip, warning chip, sticker stamp, ready reward frame |

## 4. Color & Material Rules

- Background for production generation: flat `#00ff00` chroma key if transparency is needed.
- Do not use green inside the button art.
- Button art should be dark street-running game material: wet asphalt black, charcoal sticker backing, dirty cream ink, safety orange, cyan signal, worn yellow tape.
- Corners should be 4-6px, rough and printed, not rounded SaaS pills.
- Shadows should be hard black sticker offsets, not soft glass shadows.
- Use spray edges, torn tape, chalk scratches, route strokes, reflective strips and shoe-mark microtexture.
- No baked text, no fake logo, no watermark, no web mockup screen.

## 5. Image Generation Prompt

```text
Use case: stylized-concept
Asset type: transparent-ready UI sprite atlas for a street-running mobile game
Primary request: Create one square sprite sheet / character sheet of textless game UI button materials for "The Crew Running".

Scene/backdrop: perfectly flat solid #00ff00 chroma-key background for background removal. The background must be one uniform color with no shadows, gradients, texture, reflections, floor plane or lighting variation.

Subject: 36 separated UI button and control frames arranged in a clean 6 columns x 6 rows atlas, with generous padding between cells. No text, no letters, no numbers. Each cell is a distinct button frame or UI material, not a full app screen.

Rows:
1. Primary command frames: wide safety-orange asphalt sticker slab default, hover glow, pressed offset, focus cyan outline, disabled worn charcoal, loading scanner stripe.
2. Secondary command frames: chalk/cream outline over charcoal default, hover cyan edge, pressed rough offset, focus ring, disabled dust, compact secondary.
3. Skip/link tape frames: small top-right torn tape, underline tape, menu strip, replay strip, dev studio strip, remove strip.
4. Navigation slabs: inactive vertical asphalt tab, active tab with crew accent strip, hover tab, focus tab, runner tab with badge notch, config tab with small screw/tape corners.
5. Selector tiles: crew patch tile, selected crew tile, style thumbnail tile, selected style tile, wardrobe equipment slot, selected wardrobe slot.
6. Utility/status materials: upload selfie slot with plus-shaped cutout but no text, mini callout bubble, cyan signal chip, yellow warning chip, rough sticker stamp, reward-ready sticker frame.

Style: dark street-running game UI, Sao Paulo asphalt, graffiti spray, worn mission tickets, crew patches, reflective running gear details, route strokes, sneaker scuffs, chalk dust, torn poster texture, rough 4-6px corners, hard black sticker shadows, dirty cream ink, safety orange, spray cyan, marker yellow.

Composition: centered orthographic product-sheet view, every asset isolated, consistent lighting, crisp edges, enough empty green around each object for later extraction.

Avoid: any readable text, letters, numbers, logo, watermark, realistic phone screen, SaaS cards, glossy glassmorphism, rounded pills, cyberpunk neon overload, soft blurred shadows, green pixels inside the assets.
```

## 6. Production Notes

- Use the generated atlas as visual source first; implement final button text and hover/focus behavior in CSS.
- If the atlas is used directly in production, extract sprites from cells or use CSS background-position after transparent cleanup.
- Preserve live text for `aria-label`, keyboard focus, disabled state and localization.
- Keep dev/studio buttons visually quiet so they do not compete with player progression.

## 7. Generated Atlas V1

Generated files:

- Chroma-key source: `public/ui/button-atlas-v1-chromakey.png`
- Transparent atlas: `public/ui/button-atlas-v1.png`

Image facts:

- Size: 1254 x 1254.
- Format: PNG.
- Final alpha: yes.
- Layout: 6 x 6 textless UI material sheet.

V1 is intended as art direction and sprite extraction source. It should not be used with baked labels; labels remain live in React/CSS.

## 8. Implementation V1

Implemented in `index.css` as responsive CSS button surfaces, using the generated atlas as art direction/reference instead of a scalable production background.

The direct CSS sprite approach was removed because a 6 x 6 atlas cell does not scale cleanly across live text, compact controls, mobile widths and changing button labels. Production buttons now keep deterministic CSS geometry, live text, accessible states and street-game material treatments. If the atlas is needed later, extract individual cells into purpose-sized assets instead of applying the whole sheet as a fluid background.

Covered classes:

- Primary commands: `.btn-solid`, `.main-menu__primary`, `.game-command--primary`.
- Secondary commands: `.btn-chalk`, `.game-command`.
- Skip/link controls: `.launch-skip`, `.guided-onboarding__back`, `.btn-link`, `.main-menu__nav-link`.
- Menu navigation: `.main-menu__nav-item`.
- Crew selectors: `.crew-pilot-preview__item`.
- Creator selectors: `.runner-creator__style-card`, `.runner-creator__wardrobe-tile`.
- Utility controls: `.upload-zone`, `.game-command--mini`, `.signal-chip`, `.guided-onboarding__meter button`.

The `CRIAR RUNNER` button exposes `aria-busy` and `.is-loading`; the loading state is rendered with live text and CSS scanner treatment, not baked atlas text.
