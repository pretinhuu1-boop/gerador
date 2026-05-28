# Visual Contract Audit — Aba VOCÊ Fase 1 — 2026-05-28

## Method
Cross-checked DESIGN.md tokens (§4 colors, §5 type, §6 geometry/shadow/texture, §8 button grammar) against the runtime painting aba VOCÊ today: `MainMenu.tsx` panel `runner` (L421-465), CSS surfaces in `index.css` (`.main-menu__leader`/`__passport-*`, `.main-menu__panel`, `.main-menu__runner-pass`, `.main-menu__nav-item`, `.btn-solid/.btn-chalk/.btn-link`, `.mission-ticket`), reused primitives (`SheetPreview`, `CrewBadge`, `CartridgeButton`), `CustomizeScreen` (surface only), and the launch envelope (`.launch-screen`). Refs: DESIGN.md, GAME_UI_TEMPLATE.md, BUTTON_ASSET_MAP.md, `vault/2026-05-28-main-menu-hq-action-plan.md`, `/Users/belissima/.claude/plans/toasty-riding-sloth.md`. Lens: anything that would make a FeedPost dropped here read as SaaS, dashboard, Instagram-glass, or CRM.

## Achados / Recomendações (violações no estado atual)
- `apps/crew-running/index.css:1335-1361`: [major] `.launch-city-map__routes path` `drop-shadow(0 0 10px rgba(46,196,182,0.42))` + `.launch-city-map__scanner` `box-shadow: 0 0 34px ..., inset 0 0 28px ...` + `border-radius: 999px` — violates §6 (no soft elevation, no cyber glow, no pills outside status tape). Fix: drop drop-shadow on routes; scanner becomes a 4-6px rounded square hand-drawn frame via `filter: url(#rough-mid)`.
- `apps/crew-running/index.css:584-589`: [major] `.street-backdrop__ping` uses `border-radius: 999px` + soft halo. Replace with 4-6px rounded square + `box-shadow: 4px 4px 0 #000`. Pre-existing, but the aba sits over this backdrop.
- `apps/crew-running/index.css:779`: [major] `.console-boot__panel` `backdrop-filter: blur(6px)` — explicit glassmorphism, §6 forbidden. Out of F1 scope; flagged so FeedPost never inherits.
- `apps/crew-running/components/launch/MainMenu.tsx:432-447` (CSS `.main-menu__runner-pass` L1855-1869): [major] only feed-like surface today is pinned to `--spray-green` (#7be82c). Green is reserved for "crew energy / safe-ready" — fine for RUNNER SALVO badge, wrong as the generic feed card. F1 needs per-variant accent (see below), not a single green rail.
- `apps/crew-running/components/launch/MainMenu.tsx:423-431`: [major] panel `runner` pitch runs as Inter body. OK for narration, wrong for any FeedPost headline — those MUST be Anton uppercase (§5 command UI).
- `apps/crew-running/components/launch/MainMenu.tsx:62-63`: [minor] `getSavedCharacter()` read once via `useMemo` — F1 feed must repaint on new IdentityEvent. Visual impact: pulse animation has nothing to animate against. Architect (#5) owns.
- `apps/crew-running/components/CustomizeScreen.tsx:265`: [minor] `"TESTE LOCAL NAO CHAMA GEMINI"` — prototype language, hidden in modal, flag for cleanup.
- Primitives `CartridgeButton.tsx`, `CrewBadge.tsx`, `SheetPreview.tsx`: pristine, reuse as-is.

## Estado atual vs F1

### MainMenu panel runner (a aba)
- Colors: panel bg `linear-gradient(rgba(0,0,0,0.86), rgba(0,0,0,0.56)) + rgba(0,0,0,0.78)` ✓ asphalt family. Left border `var(--crew-accent)` ✓. Eyebrow `--spray-cyan-bright` (#34d9ca) ✓. Status grid `--gray-text` label + `--spray-cyan-bright` value ✓. The `--spray-green` rail on `.main-menu__runner-pass` is correctly scoped to "saved" but must NOT become the default FeedPost accent.
- Type: Bowlby for h1 ✓, JetBrains Mono for eyebrow/status ✓, Anton for `__panel-head strong` ✓, Inter for paragraphs ✓. Brush is used only in `.runner-saved__panel p` at 20px (borderline) and `.main-menu__nav-link` (tag-OK).
- Geometry/shadow/texture: `border-radius: 5px` ✓ (4-6px §6). `box-shadow: inset 0 0 0 1px rgba(240,235,224,0.12)` hairline + outer hard `5px 5px 0 rgba(0,0,0,0.82)` ✓. `mission-ticket::before` paints `/textures/board.png` 20% screen ✓.
- Class soup: Tailwind nearly unused (only `mt/mb` utilities in CustomizeScreen). `.main-menu__*` + `.mission-ticket` + `.game-command` dominate. Healthy — DO NOT extend `tailwind.config.js` for FeedPost; keep colors in CSS vars so crew accent stays dynamic.

### CustomizeScreen
- Surface = `runner-creator mission-ticket` over 2-col layout. Token-clean (Bowlby title, HandUnderline marker, `signal-chip` status strip, `mission-ticket` body). Inline ESTÚDIO/AJUSTE uses `btn-link` — precedent for F1 inline EditTrigger. Disabled state at `.btn-solid:disabled` (`index.css:3878-3886`) = `#3a3934`; reuse exact treatment for the "ABRIR MAPA SOCIAL" placeholder.

### SheetPreview, CrewBadge, CartridgeButton (primitives)
- `SheetPreview`: `mission-ticket` surface, `.game-command--mini` orange stickers with `3px 3px 0 #000` ✓, `runner-creator__save-stamp` rotate(-3deg) sticker ✓. Safe to embed as FeedPost "Visual criado" thumbnail.
- `CrewBadge`: pure `<img>` with `--crew-accent` injected. Sizes `sm 32 / md 48 / lg 96`. FeedHeader avatar = lg, FeedPost inline tag = sm.
- `CartridgeButton`: variants `solid / chalk / link` cover every F1 button need. No new variant.

### services/storage, data/runnerProfile, data/crewRenderContext
- N/A — no hex/font hardcoded; only strings/numbers + `accent`/`secondary` hex piped to CSS vars. Correct.

### CrewLaunchExperience
- Wraps in `.launch-screen` (cyan/orange radial gradient + grain). FeedPost surface MUST stay opaque (`rgba(0,0,0,0.78)+`) so radial doesn't tint cyan. Already true on `.main-menu__panel`; copy that.

## F1 — proposta concreta (tokens for new components)

### FeedPost
- Background: `linear-gradient(90deg, rgba(0,0,0,0.86), rgba(0,0,0,0.62)), rgba(0,0,0,0.78)` (mirror `.main-menu__panel` L1776-1778).
- Border/corners: `border-left: 4px solid var(--crew-accent)`, `border-radius: 5px`, hairline `box-shadow: inset 0 0 0 1px rgba(240,235,224,0.12)`. No right/top/bottom border — left tape rail only.
- Shadow: outer `4px 4px 0 #000` via existing `.sticker-shadow` (`index.css:62`). Never stack a second shadow.
- Type ramp: headline = Anton 18px / 0.06em / uppercase; body = Inter 14px / 1.3; meta + variant code = JetBrains Mono 10px / 0.13em / uppercase; crew zone tag = Permanent Marker 13px (and ONLY here). No Bowlby inside FeedPost.
- Color accents: 75% asphalt, 15% `--bone` text, 7% `var(--crew-accent)` (rail + tag), 3% per-variant swatch.
- Spacing/density: `padding: 14px 16px; gap: 10px`. Mobile: `padding: 12px`, no rotation.
- Materiality cue: apply existing `.mission-ticket` class (board.png 20% + rough cream border via `::after`). No new texture.

### FeedHeader
- Background: `linear-gradient(180deg, rgba(0,0,0,0.38), rgba(0,0,0,0.82)), url(${crew.assets.banner})` (mirror `passportStyle` `MainMenu.tsx:158-162`). Never flat charcoal.
- Geometry: same as `.main-menu__leader` — `border-left: 4px solid var(--crew-accent)`, `border-radius: 5px`, `box-shadow: 5px 5px 0 rgba(0,0,0,0.82)`, `transform: rotate(-0.35deg)`.
- Type: runner name = Anton clamp(28px, 3vw, 40px) uppercase, overflow-wrap anywhere; crew zone = JetBrains Mono 10px `--spray-cyan-bright`. Stats row uses `signal-chip` styling — items count identity-belonging artifacts only: "looks salvos · 03", "stickers · 02", "crews · 1". NEVER public like/follower count.
- Texture: `crew.assets.pattern` at 28% / 360px tile / `mix-blend-mode: screen` (mirror `.main-menu__passport-pattern`).
- Inline EditTrigger: `<CartridgeButton variant="link">AJUSTAR</CartridgeButton>` per `.btn-link` (`index.css:3961-4001`). Inline edit or jump to a creator segment — never reopen the full creator modal.

### IdentityEvent card variants (treatment + grammar)
- **Look change**: rail `var(--crew-accent)`, swatch `--spray-orange`. Phrase `LOOK 02 EQUIPADO`.
- **Sheet generated**: rail `--spray-orange-bright`, 64px cropped variant thumb (5px corner). Phrase `VISUAL CRIADO` (kill "sheet/gerar").
- **Sticker drop**: rail `--spray-yellow`, sticker PNG rotated -1.5deg. Phrase `STICKER COLADO`.
- **Badge unlocked**: rail `--spray-green`, achievement PNG 48px. Phrase `BADGE NA JAQUETA`.
- **Runner type swap**: rail `--spray-cyan-bright`, runner-type icon 32px. Phrase `TIPO TROCADO · <LABEL>`.
- **Photo change**: rail `--bone-soft`, selfie thumb 64px (4px corner). Phrase `NOVA SELFIE`.
- **Guia completed**: rail `--spray-cyan`, crew marker PNG 38px. Phrase `GUIA DA CREW · OK`.

All variants: never show like/comment/view counts. Never show "public" badge — F1 stays private (§11).

### Friends strip placeholder (F2 hook)
Horizontal strip below FeedHeader: `display: flex; gap: 8px; padding: 10px 14px; border-radius: 5px; border-left: 4px solid rgba(240,235,224,0.2); background: rgba(0,0,0,0.58)`. Disabled tone: opacity 0.5 + `filter: saturate(0.7)`, cursor `not-allowed`. Static label JetBrains Mono 10px `AMIGOS · ABRE NA FASE 2`. Avatars = own-crew badges tiled 5x at 36px with -8px overlap (mirror `.main-menu__passport-members`). No empty slots, no fake names, no `follow` CTA. `aria-hidden="true"` until F2.

### "ABRIR MAPA SOCIAL" button (F2 hook)
`<CartridgeButton variant="chalk" disabled className="game-command">MAPA SOCIAL · EM BREVE</CartridgeButton>`. `chalk` not `solid` — must not compete with the live primary (`AJUSTAR/MONTAR RUNNER`). Disabled state already encoded in `.btn-chalk:disabled` (`index.css:3953-3957`) = cream-on-black at 0.42 alpha, no pointer. Forbidden labels: `OPEN MAP`, `EXPLORE`, `DISCOVER`.

## Hooks pra F2/F3 (não implementar agora)
- Friends-strip DOM slot reserves the row above FeedPost stream — F2 hydrates same `<div className="voce__friends-strip">` with NFC/QR pings.
- "MAPA SOCIAL · EM BREVE" button reserves the secondary command slot — F2 swaps `disabled` → `onClick`.
- FeedPost rail accent already varies per variant — F2/F3 add "rádio crew", "DM", "story" variants by picking from the same palette, no chrome redesign.
- Reserve `padding-top: 0` on FeedHeader so a future Stories-24h strip can stack flush (F3).

## Top priorities
1. [blocker] `MainMenu.tsx:421-465` — replace panel `runner` body with FeedHeader + Friends-strip placeholder + FeedPost list. Keep `.main-menu__panel` chrome.
2. [major] `MainMenu.tsx:62-63` — make `savedCharacter` read live (sub to IdentityEvent store). Visual: needed for entry animation.
3. [major] `index.css:1335-1361, 584-589, 779` — pre-existing soft-glow / 999px pill / blur. Mandatory: FeedPost imports none of those.
4. [token] FeedPost = `mission-ticket` + `border-left: 4px solid var(--crew-accent)` + `box-shadow: 4px 4px 0 #000`. Single chrome; only 3% swatch + rail color shift per variant.
5. [token] All F2-hook disabled buttons use `btn-chalk:disabled`, never greyed-out solid. So "EM BREVE" reads as "later", not "broken".
6. [grammar] Forbidden inside aba VOCÊ: `LIKE`, `FOLLOW`, `SHARE`, `VIEWS`, `GERAR`, `SHEET`, `MVP`, `PREVIEW`, `API`, `DASHBOARD`. Use `VOCÊ` not `PROFILE`, `EVENTO` not `POST`.

## Open questions
- FeedHeader selfie: lg 96px square (5px corner + sticker-shadow-crew) or push to 128px? Lean 96px, confirm with human.
- `STICKER COLADO` rendering: 120px inline (sticker IS the content) or 48px thumb + "ver maior"? Lean 120px.
- "Guia completed" — fires once total or on every re-run? Architect #5 to dedupe.
- Friends strip in F1: 0 real data (wallpaper) or seeded with own-crew avatars only? Lean own-crew only — feels inhabited without faking social proof.
