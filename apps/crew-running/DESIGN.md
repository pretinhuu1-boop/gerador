# Design System: The Crew Running

**Project scope:** game launch, title/menu entry, guided setup and runner character creation.
**Out of scope for this phase:** real run activation, GPS permission, run tracking, live route publication and post-run recap.

## 1. Product Thesis

The Crew Running should not feel like a fitness utility with street styling. It should feel like a street-running game cartridge turning on above Sao Paulo: asphalt, worn paint, crew patches, adult runners, a living city signal and a clear path toward creating a runner identity.

Core line:

> O app nao abre. A cidade liga.

Interpretation:

- The app starts as a ritual, not a form.
- The city signal appears before any technical setup.
- The player becomes a runner before being asked to run.
- Character creation is the first playable commitment.

## 2. Flow Contract

The approved flow stops at character creation:

```text
Cold Boot
  -> Opening / Title
  -> City Signal Entry
  -> Character-Guided Setup
  -> Runner Creator
  -> Runner Saved / City Ready teaser
```

Do not route the user directly into a run. Not every player opens the app only when ready to run. The first session is about identity, confidence and belonging.

### Screen Responsibilities

| Screen | Job | Primary Feeling | CTA |
| --- | --- | --- | --- |
| ConsoleBoot | Make the device feel like it is reading the city signal. | system wake, anticipation | PULAR |
| Opening / Title | Establish The Crew Running as a game. | title screen, city online | ENTRAR |
| City Signal Entry | Show crews and map as a living world. | territory, signal, invitation | COMEÇAR |
| Main Menu / QG | Let the player choose crew, review state and enter setup or creator. | mission HQ, crew gate | COMEÇAR / MONTAR RUNNER |
| Character-Guided Setup | Explain only what is needed before identity creation. | guided mission, safety, belonging | CRIAR RUNNER |
| Runner Creator | Let the player build and save a runner identity. | locker room, self-expression | CRIAR RUNNER / EQUIPAR |
| Runner Saved / City Ready | Confirm identity without implying run activation. | ready stamp, city teaser | VOLTAR AO SINAL |

## 3. Visual Theme & Atmosphere

The atmosphere is dark, tactile and kinetic. It should feel like a printed mission ticket taped to asphalt, a crew patch on a running jacket, and a city map lit by collective movement.

Use street culture as an interaction system, not decoration:

- Graffiti appears as lock-on, confirmation, crew energy and saved-state stamps.
- Running appears as route strokes, checkpoints, crew pulse, sneaker marks and reflective tape.
- Game UI appears as title screen, mission ticket, selection cursor, badge unlock and character equipment.

Avoid:

- Generic hacker terminal as the dominant boot language.
- SaaS cards, dashboard widgets or admin-style panels.
- Cyber scanner glow as the primary art direction.
- Product/prototype labels such as API KEY, MVP, GERAR, PREVIEW or sheet.

## 4. Color Palette & Roles

### Core Materials

| Token | Name | Hex | Role |
| --- | --- | --- | --- |
| `--black` | Wet Asphalt Black | `#000000` | deepest page background and cinematic black frames |
| `--jet` | Burnt Rubber Black | `#0a0a0a` | primary app surface |
| `--char` | Charcoal Sticker Backing | `#131313` | mission tickets, runner creator panels |
| `--char-2` | Graphite Layer | `#1a1a1a` | secondary surfaces and inactive tabs |
| `--gray-deep` | Worn Pavement | `#222222` | map streets and inactive state fills |
| `--gray-line` | Chalk Scratch Line | `#4a4a4a` | dividers and low-emphasis outlines |
| `--bone` | Dirty Cream Ink | `#f0ebe0` | main readable text |
| `--bone-soft` | Faded Poster Cream | `#c8c2b5` | secondary copy |
| `--gray-text` | Dust Gray | `#8a8580` | metadata and disabled labels |

### Signal Colors

| Token | Name | Hex | Role |
| --- | --- | --- | --- |
| `--spray-cyan` | Spray Cyan | `#2ec4b6` | active signal, map pulse, focus state |
| `--spray-cyan-bright` | Wet Cyan Paint | `#34d9ca` | active labels and lock-on flashes |
| `--spray-yellow` | Marker Yellow | `#f4a52c` | reward hints, mission accents |
| `--spray-yellow-bright` | Fresh Marker Yellow | `#ffc02d` | unlock flash and warning highlights |
| `--spray-orange` | Safety Orange | `#e85d2c` | primary action family |
| `--spray-orange-bright` | Hot Sole Orange | `#ff6b35` | main CTA and title accents |
| `--spray-red` | Alert Red | `#c9302c` | Downtown Rush and high-intensity states |
| `--spray-green` | Turf Green | `#7be82c` | crew energy, safe-ready state |

### Crew Accents

| Crew | Zone | Accent | Secondary |
| --- | --- | --- | --- |
| Downtown Rush | Centro | `#C9302C` | `#F4A52C` |
| North Breakers | Norte | `#2EC4B6` | `#7BE82C` |
| South Striders | Sul | `#4DA3B5` | `#7BE82C` |
| East Burners | Leste | `#E85D2C` | `#F4A52C` |
| West Flow | Oeste | `#2EC4B6` | `#F4A52C` |

Use a 75 / 15 / 7 / 3 balance:

- 75% asphalt and charcoal.
- 15% dirty cream text and strokes.
- 7% current crew color.
- 3% status/reward colors.

## 5. Typography Rules

| Font | Role | Rules |
| --- | --- | --- |
| `Bowlby One` | title impact | game titles, screen titles, one major statement per viewport |
| `Anton` | command UI | menu items, crew names, action labels, slot headings |
| `JetBrains Mono` | system readout | boot lines, coordinates, zone status, short chips |
| `Permanent Marker` | street tag | logo marks, stamps, short tags only |
| `Inter` | utility copy | readable body text, controls, accessibility-critical copy |
| `Bungee` | rare accent | sparingly for celebratory labels, never body text |

Do not use brush lettering for paragraphs. Use it like a tag or stamp. Body copy should be short and stable.

## 6. Shape, Surface & Texture

The UI should look printed, taped and scuffed, not like rounded-glass app chrome.

- Corners: 4-6px for buttons, tickets and panels; 0-3px for stamps and state labels. Avoid pill shapes unless the element is explicitly a piece of status tape.
- Rough filters: use `filter: url(#rough-soft)` for tiles and inputs, `url(#rough-mid)` for selected buttons and active states, and `url(#rough-strong)` only for hand underlines, stamps and rough marks.
- Shadows: hard black sticker offsets and short signal glows. Avoid soft SaaS elevation.
- Borders: cream, cyan or orange spray-stroke edges. Selected crew surfaces should inherit the current crew accent.
- Backgrounds: asphalt grain, chalk dust, map lines, territory patterns and worn poster texture. Key screens should never be plain charcoal panels only.
- Layers: world/map layer, sticker or mission-ticket layer, command layer. Do not put cards inside cards.

## 7. Asset Language

Primary assets already exist and should be first-class UI primitives:

| Asset | Path | Role |
| --- | --- | --- |
| Logo | `public/brand/logo.png` | boot/title mark and small HUD identity |
| Splash | `public/brand/splash.png` | opening/title hero texture |
| Board texture | `public/textures/board.png` | asphalt/chalkboard grain for full-screen surfaces |
| Crew badge | `public/crews/{slug}/badge_128.png` | selection cursor, saved state, crew identity |
| Crew banner | `public/crews/{slug}/banner.png` | title/crew hero and mission background |
| Crew leader | `public/crews/{slug}/leader.png` | guide/mentor, should be treated as character art |
| Crew members | `public/crews/{slug}/members/*.png` | background crew presence and social proof, not required profile setup |
| Crew marker | `public/crews/{slug}/marker.png` | map and territory pin |
| Mission card | `public/crews/{slug}/mission_card.png` | first mission ticket and card surface |
| Territory pattern | `public/crews/{slug}/territory_pattern.png` | zone fill and map material |
| Locked fog | `public/crews/{slug}/locked_fog.png` | unrevealed zones, not generic blur |
| Stickers | `public/crews/{slug}/stickers/*.png` | saved, ready and selected stamps |
| Achievements | `public/crews/{slug}/achievements/*.png` | teaser rewards and locked badges, not leaderboard pressure |
| Crew pings | `public/intro/crew-pings/{slug}.png` | city signal ping |
| Backgrounds | `public/backgrounds/*.jpg` | full-screen boot, city, QG and saved-state backdrops |
| Button atlas | `public/ui/button-atlas-v1*.png` | textless material reference for command surfaces |
| Wardrobe icons | `public/wardrobe/**` | equipment slots for top, bottom, shoes and accessory |

Known asset limitation:

- Current `leader.png` files are square illustrated portraits, not transparent cutouts. Until cutouts exist, compose them as sticker portraits, crew posters or mission-card art. Do not pretend they are full-body transparent characters.

## 8. Component Styling

### Buttons

Primary buttons are game commands, not web CTAs.

- Shape: mostly squared with 4-5px corners.
- Surface: safety orange or crew accent.
- Text: Anton or Bowlby, uppercase.
- Interaction: press snap, slight offset, sticker-like impact.
- Reduced motion: color/border state only.

Labels:

- Use `ENTRAR`, `COMEÇAR`, `CRIAR RUNNER`, `EQUIPAR`, `VOLTAR AO SINAL`.
- Avoid `GERAR`, `PREVIEW`, `SUBMIT`, `API KEY` in player-facing UI.

### Mission Tickets

Mission tickets replace generic cards.

- Background: mission card asset or charcoal with torn/spray border.
- Content: zone, leader line, mission name, privacy note.
- State: `SINAL`, `PRONTO`, `SALVO`, `BETA`.
- No nested cards.

### Crew Patches

Crew patches replace list cards.

- Badge large enough to read.
- Zone and crew name in strong type.
- Mission line short.
- Active state changes map, leader, color and ticket.

### City Map

The city map is a world surface, not a framed data widget.

- Full-bleed when possible.
- Use pings, markers, territory patterns and route strokes.
- Shows aggregate signal only. No personal route in this phase.
- Map states: dark, scanning, signal found, crew selected, runner ready.

### Leader Dialogue

Leader dialogue is in-world guidance.

- One leader line per step.
- One player action per step.
- Avoid explanatory product copy.
- Use sticker/mission-ticket surface, not modal card.

### Runner Creator

Runner Creator is a locker room / character creator.

- Central identity area: photo/avatar or written character brief, selected crew, runner type and generated sheet.
- Left or bottom rail: identity source, runner profile, runner type and wardrobe slots.
- Profile controls: name, sex, height, weight and personality.
- Equipment controls: top, bottom, shoes and accessory.
- Generation rule: use the photo only as broad physical-characteristics reference, or use the written brief when the player chooses no-photo mode; do not inherit an exact real face, identity, hair or clothing from the photo.
- Sheet rule: generate a neutral-background 2x2 reference sheet, then crop the chosen look and remove the neutral background for saved PNG usage.
- Actions: `MISTURAR LOOK`, `CRIAR RUNNER`, `EQUIPAR`.
- Dev generation key is hidden under settings/dev mode, never primary surface.

## 9. Layout Principles

Desktop:

- Use one dominant visual plane per screen.
- Keep command navigation in one edge column.
- Let map/leader/runner own the viewport.
- Avoid dense explanatory copy.

Mobile:

- CTA must remain visible in the first scroll region.
- Stack in this order: identity/title, action, mission/guide, visual support.
- Avoid tiny labels over detailed texture.
- Keep touch targets at least 44px high.

Screen density:

- Boot: sparse.
- Title: poster-like.
- City Entry: map-heavy.
- Guided Setup: one prompt + one action.
- Runner Creator: dense but organized like equipment UI.

## 10. Motion Grammar

Motion should feel like game feedback, not page decoration.

### Boot

- Black frame.
- Short signal bursts.
- Lock confirmation.
- No long terminal wait.

Timing:

- Glitch/black frame: 80-120ms.
- Boot lines: 80-140ms burst cadence.
- Final lock: 160-220ms.

### Map Signal

- Routes draw in 550-750ms.
- Active crew receives lock-on and residual halo.
- Crew change shifts map slightly and updates ticket immediately.

### Menu Selection

- Active cursor/slab moves between commands.
- Hover/tap should feel like arcade selection.
- Confirmation may use a short stamp or route flash.

### Runner Creator

- Equipment selection gets a snap/sticker border.
- Randomize rolls quickly, then lands.
- Save runner uses a short `RUNNER READY` stamp.

### Reduced Motion

Always support `prefers-reduced-motion`.

- No parallax.
- No blur.
- No zoom wipes.
- No infinite scanner loops.
- Use instant state swaps, color, border, icon and text.

## 11. Copy Voice

Voice: short, urban, safe, PT-BR, not forced slang.

Rules:

- Say what the player does now.
- Say why it matters to the crew.
- Keep privacy clear before any real movement feature.
- Never shame rhythm, walking or rest.

Good:

- `A cidade ouviu seu sinal.`
- `Escolha uma crew para vestir o mapa.`
- `Sua rota fica privada. A crew recebe o pulso.`
- `Monte seu runner. Depois a cidade abre.`

Avoid:

- `MVP`
- `gerar`
- `API key`
- `ranking cedo`
- `vença`
- `GPS obrigatório`
- `rota pública`

## 12. Screen Acceptance Checklist

Use this before approving any launch/creator screen:

- The screen has one dominant game idea.
- The player knows the next action in under 3 seconds.
- Street elements are tied to state or feedback.
- Running appears through route, crew pulse, shoe, checkpoint or movement language.
- Crew identity affects color, badge, copy and map.
- Text is legible without explaining the UI.
- No player-facing prototype language appears.
- The screen works at mobile width without horizontal overflow.
- Reduced motion has an intentional alternate state.
- The flow still stops at runner creation; no run activation is requested.

## 13. Implementation Boundaries

Do now:

- Title/entry/game shell.
- Crew signal and crew selection.
- Character-guided setup.
- Runner identity and wardrobe creation.
- Runner saved / city ready teaser.
- Local persistence for seen states and saved runner.

Do later:

- Actual run start.
- GPS permissions.
- Live route tracking.
- Real heatmaps.
- Post-run recap.
- Social publishing.
