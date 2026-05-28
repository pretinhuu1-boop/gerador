# Gamified UI Template: The Crew Running

Use this template to design or implement any new screen in the launch-to-character-creation flow.

## 1. Screen Brief Template

```markdown
## Screen Name
[ConsoleBoot | TitleScreen | CitySignalEntry | MainMenu | GuidedSetup | RunnerCreator | RunnerSaved]

## Entry Condition
Where did the player come from, and which persisted state allows this screen?

## Exit Condition
Where does the primary action go? Where do secondary actions go?

## Player State
- first_visit:
- boot_seen:
- intro_seen:
- selected_crew:
- runner_created:

## Screen Job
One sentence. What must the player understand or do now?

## Game Fantasy
One sentence. What part of the world is becoming real?

## Primary Action
Button label:
Result:

## Secondary Actions
- label:
  result:

## Required Assets
- brand:
- crew:
- map:
- texture:
- stickers/rewards:
- runner/wardrobe:

## Tokens
Dominant material:
Accent colors:
Type roles:
Surface treatment:

## Layout
Desktop:
Mobile:

## Motion
Default:
Reduced motion:

## States
Default:
Loading:
Blocked/error:
Complete:

## A11y
Keyboard order:
Focus state:
ARIA label/live region:
Reduced motion equivalent:

## Copy
Title:
Leader line:
Support line:
State labels:

## Acceptance
- [ ] feels like game UI, not SaaS
- [ ] next action is obvious
- [ ] entry and exit match the flow contract
- [ ] tokens match `DESIGN.md`
- [ ] no run activation requested
- [ ] no prototype language
- [ ] mobile safe
- [ ] reduced motion safe
```

## 2. Component Template

```tsx
type GameScreenProps = {
  playerState: {
    selectedCrewSlug?: string;
    runnerCreated: boolean;
    reducedMotion: boolean;
  };
  onPrimaryAction: () => void;
  onSecondaryAction?: () => void;
};

export const GameScreen = ({ playerState, onPrimaryAction }: GameScreenProps) => {
  return (
    <section className="game-screen game-screen--[screen-name]">
      <div className="game-screen__world" aria-hidden>
        {/* map, banner, texture, crew signal */}
      </div>

      <header className="game-screen__identity">
        {/* logo, crew badge, state chips */}
      </header>

      <main className="game-screen__stage">
        {/* one dominant visual: map, leader, runner, or mission ticket */}
      </main>

      <nav className="game-screen__commands" aria-label="Comandos">
        <button className="game-command game-command--primary" type="button" onClick={onPrimaryAction}>
          PRIMARY LABEL
        </button>
      </nav>
    </section>
  );
};
```

## 3. Screen Recipes

### ConsoleBoot

Goal: the city signal wakes up.

```text
Visual: black asphalt, logo, short system lines, route pulse.
Copy: CREW_OS / CITY SIGNAL / RUNNER ID STANDBY.
Entry: first app load when boot has not been seen.
Primary: PULAR.
Exit: goes to TitleScreen, not straight to RunnerCreator.
Motion: burst lines, scanner lock, one route flash.
Reduced: all lines shown immediately, short transition.
```

Checklist:

- [ ] Does not look like generic hacker terminal.
- [ ] Includes running/city language.
- [ ] Skip does not erase the whole game intro unless explicitly intended.

### TitleScreen

Goal: make the product feel like a game before any setup.

```text
Visual: brand/splash.png, logo, city texture, one pulsing route.
Title: THE CREW RUNNING.
Support: O app nao abre. A cidade liga.
Entry: from ConsoleBoot or from reset/replay intro.
Primary: ENTRAR.
Secondary: PULAR INTRO.
Exit: ENTRAR goes to CitySignalEntry; PULAR INTRO goes to RunnerCreator only if the user already has enough setup context.
Motion: press-start pulse, city signal sweep.
Reduced: static title and clear button.
```

Checklist:

- [ ] First viewport reads as a title screen.
- [ ] Brand is the loudest element.
- [ ] No form, API key or settings appear.

### CitySignalEntry

Goal: show that the city is made of crews before asking for identity.

```text
Visual: full-bleed symbolic Sao Paulo map, five crew pings, active mission ticket.
Entry: from TitleScreen.
Primary: COMEÇAR.
Secondary: CREWS DA CIDADE.
State chips: SINAL ONLINE, ROTA PRIVADA, 5 CREWS.
Exit: goes to GuidedSetup.
Motion: active crew lock-on, route stroke, badge pulse.
Reduced: static pings and selected ticket.
```

Checklist:

- [ ] Pings use crew badges/markers, not generic dots.
- [ ] Map feels like territory, not dashboard radar.
- [ ] No personal route is shown.

### MainMenu / QG

Goal: make the QG the main command surface after the intro.

```text
Visual: full-screen QG backdrop, active crew leader/poster, mission ticket and nav slabs.
Entry: from CitySignalEntry, returning visits, saved teaser, or replay exit.
Primary before guide: COMEÇAR.
Primary after guide: MONTAR RUNNER.
Primary after saved runner: AJUSTAR RUNNER.
Panels: INÍCIO, CREWS PILOTO, RUNNER, CONFIG.
Saved state: RUNNER READY pass with saved PNG and runner name.
Exit: guide, creator, intro replay or QG panel change.
Motion: nav cursor, ticket transition, crew poster swap.
Reduced: instant panel changes and static backdrop.
```

Checklist:

- [ ] QG does not duplicate onboarding copy.
- [ ] Saved runner is visible without implying run activation.
- [ ] `REVER INTRO` remains secondary.

### GuidedSetup

Goal: prepare the player for runner creation through a character-guided mini mission.

```text
Visual: leader sticker/portrait, mission ticket, map fragment.
Entry: from CitySignalEntry or after replaying the guide.
Steps:
1. A cidade ouviu seu sinal.
2. Escolha uma crew para vestir o mapa.
3. Sua rota fica privada; a crew recebe o pulso.
4. Monte seu runner.
Primary: CRIAR RUNNER.
Secondary: PULAR TUTORIAL.
Exit: goes to RunnerCreator.
Motion: mission ticket punch, checkpoint meter.
Reduced: step changes are instant.
```

Checklist:

- [ ] One action per step.
- [ ] No MVP/product explanation.
- [ ] Leader feels like a guide, not decoration.

### RunnerCreator

Goal: create the player's runner identity before any real running feature.

```text
Visual: central runner/sheet, crew badge, runner type, profile fields, wardrobe slots.
Entry: from GuidedSetup, PULAR TUTORIAL, or returning to edit identity.
Primary: CRIAR RUNNER.
Secondary: MISTURAR LOOK.
Hidden/dev: studio credential modal behind settings/dev action only.
States:
- no_selfie: prompt for selfie/avatar base
- no_studio_credential: dev modal only
- generating: CREW STUDIO / criando runner
- saved: RUNNER READY stamp
Exit: saved runner goes to City Ready teaser or main menu locked to non-run features.
Motion: equipment snap, random roll, save stamp.
Reduced: instant selected states.
Generation:
- photo is broad physical-characteristics reference only
- name, sex, height, weight, personality and runner type influence the sheet
- selected crew locks palette/reference assets
- output uses neutral matte background before saved PNG cleanup
```

Checklist:

- [ ] Looks like character creation, not image-generation tooling.
- [ ] Does not inherit exact face, hair or identity from the uploaded photo.
- [ ] Uses crew assets only from the selected crew context.
- [ ] Uses wardrobe assets from `public/wardrobe`.
- [ ] Save state returns to a city-ready teaser, not run activation.

### RunnerSaved

Goal: confirm the saved identity and stop the phase cleanly.

```text
Visual: saved city backdrop, runner PNG, crew sticker, achievement teaser.
Entry: after `EQUIPAR` a generated look.
Primary: VOLTAR AO SINAL.
Secondary: AJUSTAR RUNNER.
State: RUNNER READY / CIDADE PRONTA.
Exit: QG or RunnerCreator.
Motion: short ready stamp and reward placement.
Reduced: static stamp and immediate state.
```

Checklist:

- [ ] `crewRunnerCustomized` is marked.
- [ ] Saved PNG uses removed neutral background.
- [ ] No next action starts or schedules a run.

## 4. Copy Bank

### Commands

- ENTRAR
- COMEÇAR
- CRIAR RUNNER
- MISTURAR LOOK
- EQUIPAR
- VOLTAR AO SINAL
- CREWS DA CIDADE

### State Chips

- SINAL ONLINE
- ROTA PRIVADA
- CREW EM CHAMADA
- RUNNER ID
- LOOK SALVO
- CIDADE PRONTA

### Leader Lines

- A cidade ouviu teu sinal.
- Aqui o mapa acende por presença, nao por exposicao.
- Sua rota fica privada. A crew recebe so o pulso.
- Escolhe uma crew. Depois monta teu runner.
- Sem pressa. Caminhada tambem conta para entrar.
- Runner pronto. A cidade abre depois.

## 5. Prompt Template For New Screens

```text
Create a The Crew Running game UI screen for [SCREEN_NAME].

Scope: only launch through runner character creation. Do not include GPS permission, live run start, tracking, public route sharing, or post-run recap.

Visual language: dark street-running mobile game, asphalt black, charcoal sticker surfaces, dirty cream ink, worn spray paint, crew patches, mission tickets, symbolic Sao Paulo map, adult urban runners, running route strokes and sneaker/reflective details.

Use these assets when relevant:
- /brand/logo.png
- /brand/splash.png
- /textures/board.png
- /crews/{slug}/badge_128.png
- /crews/{slug}/banner.png
- /crews/{slug}/leader.png
- /crews/{slug}/members/*.png
- /crews/{slug}/marker.png
- /crews/{slug}/mission_card.png
- /crews/{slug}/territory_pattern.png
- /crews/{slug}/stickers/*.png
- /crews/{slug}/achievements/*.png
- /intro/crew-pings/{slug}.png
- /wardrobe/**
- /backgrounds/*.jpg
- /ui/button-atlas-v1*.png

Layout:
- one dominant visual idea
- no SaaS cards
- no nested cards
- strong primary command
- mobile first, no horizontal overflow

Entry/Exit:
- define the screen entry condition
- define the primary and secondary exit conditions
- never exit into live run activation in this phase

States:
- default
- loading
- blocked/error
- complete

Motion:
- game feedback, not decorative fades
- lock-on, snap, route pulse, stamp
- provide reduced-motion equivalent

Copy:
- PT-BR
- short, direct, in-world
- no API KEY, MVP, GERAR, PREVIEW, dashboard or prototype language

Acceptance:
- player knows next action in under 3 seconds
- screen feels like a game
- street elements communicate state
- running appears through route, crew pulse, sneaker and checkpoint language
- flow stops at runner creation
```
