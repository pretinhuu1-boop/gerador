# Sede da Crew — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire `ENTRAR NA SEDE` button to a real destination — a 7-room sede shell with header, grid, footer, and visitor gate — without breaking existing `crewHome` panel.

**Architecture:** Add a new `'sede'` panel to `MainMenu`'s existing panel-state machine. New `components/sede/` tree owns the shell + room cards. Visitor vs member is derived from `progress.selectedCrewSlug` matching the active crew slug. No new storage. No new routes. All rooms render placeholders (filled by Phase 2-5).

**Tech Stack:** React 18 + TypeScript, framer-motion (existing), happy-dom + vitest + @testing-library/react, CSS variables in `index.css`.

**Spec ref:** [vault/2026-05-28-sede-da-crew-spec.md](2026-05-28-sede-da-crew-spec.md) section 8 Phase 1.

**Working directory for commands:** `/Users/belissima/Desktop/running crew/apps/crew-running`

---

## Pre-flight

- [ ] **P.1 Confirm clean tree on `feat/map-gamification` branch**

Run: `cd "/Users/belissima/Desktop/running crew" && git status --short | grep "sede" && git log -1 --oneline`

Expected: shows `?? .../components/sede` only if previously started, plus the spec commit `docs(crew-running): spec — Sede da Crew (visual-first MVP)`. No other agent's WIP on files this plan touches: `components/launch/MainMenu.tsx`, `components/launch/menu/CrewsPanel.tsx`, `components/launch/__tests__/MainMenu.test.tsx`, `index.css`.

If another agent has uncommitted edits on those files, **defer Tasks 8-10** until they land, and start with Tasks 1-7 (new files only).

- [ ] **P.2 Validate baseline build is green before any change**

Run: `cd apps/crew-running && ./node_modules/.bin/tsc --noEmit --pretty false && npx vitest run --reporter=dot --bail 1`

Expected: exit 0, no TypeScript errors, all existing tests pass.

If red, **stop and report** — Phase 1 will not start on a red baseline.

---

## File Structure

**Create (new files):**

- `apps/crew-running/data/sedeRooms.ts` — 7 room configs (SedeRoomConfig).
- `apps/crew-running/components/sede/SedeShell.tsx` — composition root, owns `activeRoom` state.
- `apps/crew-running/components/sede/SedeHeader.tsx` — crew badge + name + capitão + member count.
- `apps/crew-running/components/sede/SedeRoomGrid.tsx` — 7-room CSS grid.
- `apps/crew-running/components/sede/SedeRoomCard.tsx` — single room card with icon, label, optional "preview" badge.
- `apps/crew-running/components/sede/SedeFooter.tsx` — VOLTAR + TROCAR CREW actions.
- `apps/crew-running/components/sede/SedeRoomPlaceholder.tsx` — "Em construção" stub used by all rooms in Phase 1.
- `apps/crew-running/components/sede/__tests__/SedeShell.test.tsx`
- `apps/crew-running/components/sede/__tests__/SedeRoomGrid.test.tsx`
- `apps/crew-running/components/sede/__tests__/SedeHeader.test.tsx`
- `apps/crew-running/data/__tests__/sedeRooms.test.ts`

**Modify:**

- `apps/crew-running/components/launch/MainMenu.tsx` — add `'sede'` to `MenuPanel` type, add `openSedePanel` handler, render `<SedeShell>` when `panel === 'sede'`, add nav rail item "SEDE", retarget `onOpenCrewHome` prop on `CrewsPanel` to `openSedePanel`.
- `apps/crew-running/components/launch/menu/CrewsPanel.tsx` — rename prop `onOpenCrewHome` → `onOpenSede` (keep button label "ENTRAR NA SEDE").
- `apps/crew-running/components/launch/__tests__/MainMenu.test.tsx` — add tests for SEDE nav item + ENTRAR NA SEDE button reaching the sede.
- `apps/crew-running/index.css` — add styles `.sede-shell`, `.sede-header`, `.sede-room-grid`, `.sede-room-card`, `.sede-footer`, `.sede-room-placeholder`, `.main-menu__nav-item--sede`.

**Out of scope for Phase 1** (deferred to Phases 2-5):

- Sponsor data (`sponsorshipManual.ts`), member roster expansion, patent tiers, ranking computation, badges integration, mural CRUD. All rooms render `SedeRoomPlaceholder` in Phase 1.

---

## Task 1: `data/sedeRooms.ts` — room config

**Files:**
- Create: `apps/crew-running/data/sedeRooms.ts`
- Test: `apps/crew-running/data/__tests__/sedeRooms.test.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/crew-running/data/__tests__/sedeRooms.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import {
  SEDE_ROOMS,
  SEDE_ROOMS_BY_ID,
  type SedeRoomId,
} from '../sedeRooms';

describe('SEDE_ROOMS', () => {
  it('exposes exactly 7 rooms for the MVP', () => {
    expect(SEDE_ROOMS).toHaveLength(7);
  });

  it('has unique ids across the list', () => {
    const ids = SEDE_ROOMS.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('exposes the spec ids in display order', () => {
    expect(SEDE_ROOMS.map((r) => r.id)).toEqual<SedeRoomId[]>([
      'wall-of-sponsors',
      'sala-medalhas',
      'hall-patentes',
      'ranking-lendario',
      'trofeu-room',
      'mural-feed',
      'member-roster',
    ]);
  });

  it('maps every id via SEDE_ROOMS_BY_ID', () => {
    for (const room of SEDE_ROOMS) {
      expect(SEDE_ROOMS_BY_ID[room.id]).toBe(room);
    }
  });

  it('marks ranking and wall as sheets, others as screens', () => {
    const sheets = SEDE_ROOMS.filter((r) => r.surfaceType === 'sheet').map((r) => r.id);
    expect(sheets.sort()).toEqual(['ranking-lendario', 'wall-of-sponsors']);
  });

  it('keeps every room visible to visitors in MVP (gating is per-room content)', () => {
    expect(SEDE_ROOMS.every((r) => r.visitorVisible)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test, confirm failure**

Run: `cd apps/crew-running && npx vitest run data/__tests__/sedeRooms.test.ts --reporter=dot`

Expected: FAIL with `Cannot find module '../sedeRooms'`.

- [ ] **Step 3: Implement `data/sedeRooms.ts`**

Create `apps/crew-running/data/sedeRooms.ts`:

```typescript
export type SedeRoomId =
  | 'wall-of-sponsors'
  | 'sala-medalhas'
  | 'hall-patentes'
  | 'ranking-lendario'
  | 'trofeu-room'
  | 'mural-feed'
  | 'member-roster';

export type SedeRoomSurface = 'screen' | 'sheet';

export interface SedeRoomConfig {
  id: SedeRoomId;
  label: string;
  shortLabel: string;
  iconKey: string;
  surfaceType: SedeRoomSurface;
  visitorVisible: boolean;
  memberOnly: boolean;
}

export const SEDE_ROOMS: readonly SedeRoomConfig[] = [
  {
    id: 'wall-of-sponsors',
    label: 'Wall of Sponsors',
    shortLabel: 'SPONSORS',
    iconKey: 'wall',
    surfaceType: 'sheet',
    visitorVisible: true,
    memberOnly: false,
  },
  {
    id: 'sala-medalhas',
    label: 'Sala de Medalhas',
    shortLabel: 'MEDALHAS',
    iconKey: 'medal',
    surfaceType: 'screen',
    visitorVisible: true,
    memberOnly: false,
  },
  {
    id: 'hall-patentes',
    label: 'Hall de Patentes',
    shortLabel: 'PATENTES',
    iconKey: 'patent',
    surfaceType: 'screen',
    visitorVisible: true,
    memberOnly: false,
  },
  {
    id: 'ranking-lendario',
    label: 'Ranking Lendário',
    shortLabel: 'RANKING',
    iconKey: 'rank',
    surfaceType: 'sheet',
    visitorVisible: true,
    memberOnly: false,
  },
  {
    id: 'trofeu-room',
    label: 'Trofeu Room',
    shortLabel: 'TROFÉUS',
    iconKey: 'trophy',
    surfaceType: 'screen',
    visitorVisible: true,
    memberOnly: false,
  },
  {
    id: 'mural-feed',
    label: 'Mural Feed',
    shortLabel: 'MURAL',
    iconKey: 'mural',
    surfaceType: 'screen',
    visitorVisible: true,
    memberOnly: false,
  },
  {
    id: 'member-roster',
    label: 'Member Roster',
    shortLabel: 'ROSTER',
    iconKey: 'roster',
    surfaceType: 'screen',
    visitorVisible: true,
    memberOnly: false,
  },
] as const;

export const SEDE_ROOMS_BY_ID: Readonly<Record<SedeRoomId, SedeRoomConfig>> =
  SEDE_ROOMS.reduce(
    (acc, room) => {
      acc[room.id] = room;
      return acc;
    },
    {} as Record<SedeRoomId, SedeRoomConfig>,
  );
```

- [ ] **Step 4: Run test, confirm pass**

Run: `cd apps/crew-running && npx vitest run data/__tests__/sedeRooms.test.ts --reporter=dot`

Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
cd "/Users/belissima/Desktop/running crew"
git add apps/crew-running/data/sedeRooms.ts apps/crew-running/data/__tests__/sedeRooms.test.ts
git commit -m "$(cat <<'EOF'
feat(crew-running): sede data — 7 room configs

Adds SedeRoomConfig + SEDE_ROOMS + SEDE_ROOMS_BY_ID for the sede
shell. Order, surface type (screen vs sheet), and visitor visibility
locked per spec section 5.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: `SedeRoomPlaceholder.tsx` — shared placeholder

**Files:**
- Create: `apps/crew-running/components/sede/SedeRoomPlaceholder.tsx`

Phase 1 has no per-room implementations; every card target renders this placeholder. Phases 2-5 replace per room.

- [ ] **Step 1: Implement (no separate test — covered indirectly by SedeShell test)**

Create `apps/crew-running/components/sede/SedeRoomPlaceholder.tsx`:

```typescript
import React from 'react';
import type { SedeRoomConfig } from '../../data/sedeRooms';

type Props = {
  room: SedeRoomConfig;
};

export const SedeRoomPlaceholder: React.FC<Props> = ({ room }) => (
  <section className="sede-room-placeholder" data-testid={`sede-room-${room.id}`}>
    <span className="sede-room-placeholder__eyebrow">EM CONSTRUÇÃO</span>
    <h2 className="sede-room-placeholder__title">{room.label}</h2>
    <p className="sede-room-placeholder__copy">
      Esta sala chega numa próxima onda. O esqueleto da sede já roda — falta o conteúdo.
    </p>
  </section>
);
```

- [ ] **Step 2: Commit**

```bash
cd "/Users/belissima/Desktop/running crew"
git add apps/crew-running/components/sede/SedeRoomPlaceholder.tsx
git commit -m "$(cat <<'EOF'
feat(crew-running): sede — SedeRoomPlaceholder stub

Shared "em construção" surface used by every room in Phase 1.
Replaced per-room across Phases 2-5.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: `SedeRoomCard.tsx` — single grid card

**Files:**
- Create: `apps/crew-running/components/sede/SedeRoomCard.tsx`
- Test: `apps/crew-running/components/sede/__tests__/SedeRoomCard.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `apps/crew-running/components/sede/__tests__/SedeRoomCard.test.tsx`:

```typescript
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { SedeRoomCard } from '../SedeRoomCard';
import { SEDE_ROOMS_BY_ID } from '../../../data/sedeRooms';

describe('SedeRoomCard', () => {
  it('renders the room short label', () => {
    render(
      <SedeRoomCard
        room={SEDE_ROOMS_BY_ID['sala-medalhas']}
        onOpen={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: /MEDALHAS/ })).toBeInTheDocument();
  });

  it('invokes onOpen with room id when clicked', () => {
    const onOpen = vi.fn();
    render(
      <SedeRoomCard
        room={SEDE_ROOMS_BY_ID['trofeu-room']}
        onOpen={onOpen}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /TROFÉUS/ }));
    expect(onOpen).toHaveBeenCalledWith('trofeu-room');
  });

  it('disables the button when visitor and room is memberOnly', () => {
    const memberOnlyRoom = {
      ...SEDE_ROOMS_BY_ID['mural-feed'],
      memberOnly: true,
    };
    const onOpen = vi.fn();
    render(<SedeRoomCard room={memberOnlyRoom} onOpen={onOpen} viewer="visitor" />);
    const btn = screen.getByRole('button', { name: /MURAL/ });
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(onOpen).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test, confirm failure**

Run: `cd apps/crew-running && npx vitest run components/sede/__tests__/SedeRoomCard.test.tsx --reporter=dot`

Expected: FAIL with `Cannot find module '../SedeRoomCard'`.

- [ ] **Step 3: Implement `SedeRoomCard.tsx`**

Create `apps/crew-running/components/sede/SedeRoomCard.tsx`:

```typescript
import React from 'react';
import type { SedeRoomConfig, SedeRoomId } from '../../data/sedeRooms';

export type SedeViewer = 'visitor' | 'member';

type Props = {
  room: SedeRoomConfig;
  onOpen: (id: SedeRoomId) => void;
  viewer?: SedeViewer;
};

export const SedeRoomCard: React.FC<Props> = ({ room, onOpen, viewer = 'member' }) => {
  const blocked = viewer === 'visitor' && room.memberOnly;
  return (
    <button
      type="button"
      className="sede-room-card"
      data-icon={room.iconKey}
      data-blocked={blocked || undefined}
      disabled={blocked}
      onClick={() => onOpen(room.id)}
    >
      <span className="sede-room-card__icon" aria-hidden="true" />
      <span className="sede-room-card__label">{room.shortLabel}</span>
      {blocked && <span className="sede-room-card__lock">SÓ MEMBROS</span>}
    </button>
  );
};
```

- [ ] **Step 4: Run test, confirm pass**

Run: `cd apps/crew-running && npx vitest run components/sede/__tests__/SedeRoomCard.test.tsx --reporter=dot`

Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
cd "/Users/belissima/Desktop/running crew"
git add apps/crew-running/components/sede/SedeRoomCard.tsx apps/crew-running/components/sede/__tests__/SedeRoomCard.test.tsx
git commit -m "$(cat <<'EOF'
feat(crew-running): sede — SedeRoomCard

Single grid card with icon slot, short label, member-only lock chip.
Disabled state when visitor hits a memberOnly room.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: `SedeRoomGrid.tsx` — 7-room grid

**Files:**
- Create: `apps/crew-running/components/sede/SedeRoomGrid.tsx`
- Test: `apps/crew-running/components/sede/__tests__/SedeRoomGrid.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `apps/crew-running/components/sede/__tests__/SedeRoomGrid.test.tsx`:

```typescript
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { SedeRoomGrid } from '../SedeRoomGrid';
import { SEDE_ROOMS } from '../../../data/sedeRooms';

describe('SedeRoomGrid', () => {
  it('renders one card per room', () => {
    render(<SedeRoomGrid onOpenRoom={() => {}} />);
    for (const room of SEDE_ROOMS) {
      expect(screen.getByRole('button', { name: new RegExp(room.shortLabel) })).toBeInTheDocument();
    }
  });

  it('forwards onOpenRoom with id when a card is clicked', () => {
    const onOpenRoom = vi.fn();
    render(<SedeRoomGrid onOpenRoom={onOpenRoom} />);
    fireEvent.click(screen.getByRole('button', { name: /MEDALHAS/ }));
    expect(onOpenRoom).toHaveBeenCalledWith('sala-medalhas');
  });

  it('passes viewer through to the cards', () => {
    render(<SedeRoomGrid onOpenRoom={() => {}} viewer="visitor" />);
    // No room is memberOnly in default config, so all cards are enabled.
    expect(screen.getAllByRole('button').every((btn) => !btn.hasAttribute('disabled'))).toBe(true);
  });
});
```

- [ ] **Step 2: Run test, confirm failure**

Run: `cd apps/crew-running && npx vitest run components/sede/__tests__/SedeRoomGrid.test.tsx --reporter=dot`

Expected: FAIL with `Cannot find module '../SedeRoomGrid'`.

- [ ] **Step 3: Implement `SedeRoomGrid.tsx`**

Create `apps/crew-running/components/sede/SedeRoomGrid.tsx`:

```typescript
import React from 'react';
import { SEDE_ROOMS, type SedeRoomId } from '../../data/sedeRooms';
import { SedeRoomCard, type SedeViewer } from './SedeRoomCard';

type Props = {
  onOpenRoom: (id: SedeRoomId) => void;
  viewer?: SedeViewer;
};

export const SedeRoomGrid: React.FC<Props> = ({ onOpenRoom, viewer = 'member' }) => (
  <div className="sede-room-grid" role="list">
    {SEDE_ROOMS.map((room) => (
      <div key={room.id} role="listitem" className="sede-room-grid__cell">
        <SedeRoomCard room={room} onOpen={onOpenRoom} viewer={viewer} />
      </div>
    ))}
  </div>
);
```

- [ ] **Step 4: Run test, confirm pass**

Run: `cd apps/crew-running && npx vitest run components/sede/__tests__/SedeRoomGrid.test.tsx --reporter=dot`

Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
cd "/Users/belissima/Desktop/running crew"
git add apps/crew-running/components/sede/SedeRoomGrid.tsx apps/crew-running/components/sede/__tests__/SedeRoomGrid.test.tsx
git commit -m "$(cat <<'EOF'
feat(crew-running): sede — SedeRoomGrid

Renders one SedeRoomCard per SEDE_ROOMS entry, role=list for a11y,
forwards open events to the shell.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: `SedeHeader.tsx` — crew identity bar

**Files:**
- Create: `apps/crew-running/components/sede/SedeHeader.tsx`
- Test: `apps/crew-running/components/sede/__tests__/SedeHeader.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `apps/crew-running/components/sede/__tests__/SedeHeader.test.tsx`:

```typescript
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SedeHeader } from '../SedeHeader';
import { getCrewBySlug } from '../../../data/crews';

describe('SedeHeader', () => {
  it('renders the active crew name and zone', () => {
    const crew = getCrewBySlug('east-burners');
    render(<SedeHeader crew={crew} viewer="member" />);
    expect(screen.getByText(crew.name)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(crew.zone, 'i'))).toBeInTheDocument();
  });

  it('renders the visitor badge when viewer is visitor', () => {
    const crew = getCrewBySlug('downtown-rush');
    render(<SedeHeader crew={crew} viewer="visitor" />);
    expect(screen.getByText(/VISITANTE/i)).toBeInTheDocument();
  });

  it('does not render the visitor badge when viewer is member', () => {
    const crew = getCrewBySlug('downtown-rush');
    render(<SedeHeader crew={crew} viewer="member" />);
    expect(screen.queryByText(/VISITANTE/i)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test, confirm failure**

Run: `cd apps/crew-running && npx vitest run components/sede/__tests__/SedeHeader.test.tsx --reporter=dot`

Expected: FAIL with `Cannot find module '../SedeHeader'`.

- [ ] **Step 3: Implement `SedeHeader.tsx`**

Create `apps/crew-running/components/sede/SedeHeader.tsx`:

```typescript
import React from 'react';
import type { CrewZone } from '../../data/crews';
import type { SedeViewer } from './SedeRoomCard';

type Props = {
  crew: CrewZone;
  viewer: SedeViewer;
};

export const SedeHeader: React.FC<Props> = ({ crew, viewer }) => (
  <header
    className="sede-header"
    style={{ '--crew-accent': crew.accent } as React.CSSProperties}
    data-viewer={viewer}
  >
    <div className="sede-header__badge" aria-hidden="true">
      <img src={crew.assets.badge} alt="" />
    </div>
    <div className="sede-header__copy">
      <span className="sede-header__eyebrow">{crew.zone}</span>
      <strong className="sede-header__name">{crew.name}</strong>
      <span className="sede-header__mission">{crew.mission}</span>
    </div>
    {viewer === 'visitor' && <span className="sede-header__visitor">VISITANTE</span>}
  </header>
);
```

- [ ] **Step 4: Run test, confirm pass**

Run: `cd apps/crew-running && npx vitest run components/sede/__tests__/SedeHeader.test.tsx --reporter=dot`

Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
cd "/Users/belissima/Desktop/running crew"
git add apps/crew-running/components/sede/SedeHeader.tsx apps/crew-running/components/sede/__tests__/SedeHeader.test.tsx
git commit -m "$(cat <<'EOF'
feat(crew-running): sede — SedeHeader

Crew identity bar with badge, zone, name, mission, and a VISITANTE
chip when the user is not a member of the crew.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: `SedeFooter.tsx` — VOLTAR + TROCAR CREW

**Files:**
- Create: `apps/crew-running/components/sede/SedeFooter.tsx`

(No dedicated test — covered by `SedeShell.test.tsx` in Task 7.)

- [ ] **Step 1: Implement**

Create `apps/crew-running/components/sede/SedeFooter.tsx`:

```typescript
import React from 'react';

type Props = {
  onBack: () => void;
  onSwitchCrew: () => void;
};

export const SedeFooter: React.FC<Props> = ({ onBack, onSwitchCrew }) => (
  <footer className="sede-footer">
    <button type="button" className="game-command" onClick={onBack}>
      VOLTAR
    </button>
    <button type="button" className="game-command sede-footer__switch" onClick={onSwitchCrew}>
      TROCAR CREW
    </button>
  </footer>
);
```

- [ ] **Step 2: Commit**

```bash
cd "/Users/belissima/Desktop/running crew"
git add apps/crew-running/components/sede/SedeFooter.tsx
git commit -m "$(cat <<'EOF'
feat(crew-running): sede — SedeFooter

VOLTAR + TROCAR CREW actions. Wired by SedeShell.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: `SedeShell.tsx` — composition + room state

**Files:**
- Create: `apps/crew-running/components/sede/SedeShell.tsx`
- Test: `apps/crew-running/components/sede/__tests__/SedeShell.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `apps/crew-running/components/sede/__tests__/SedeShell.test.tsx`:

```typescript
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { SedeShell } from '../SedeShell';
import { getCrewBySlug } from '../../../data/crews';

describe('SedeShell', () => {
  it('renders header + grid + footer at the home view', () => {
    const crew = getCrewBySlug('east-burners');
    render(
      <SedeShell
        crew={crew}
        viewer="member"
        onBack={() => {}}
        onSwitchCrew={() => {}}
      />,
    );
    expect(screen.getByText(crew.name)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'VOLTAR' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'TROCAR CREW' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /MEDALHAS/ })).toBeInTheDocument();
  });

  it('opens a room when its card is clicked and shows the placeholder', () => {
    const crew = getCrewBySlug('east-burners');
    render(
      <SedeShell
        crew={crew}
        viewer="member"
        onBack={() => {}}
        onSwitchCrew={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /MEDALHAS/ }));
    expect(screen.getByTestId('sede-room-sala-medalhas')).toBeInTheDocument();
  });

  it('exposes a back-to-grid action inside a room and returns to grid', () => {
    const crew = getCrewBySlug('east-burners');
    render(
      <SedeShell
        crew={crew}
        viewer="member"
        onBack={() => {}}
        onSwitchCrew={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /MEDALHAS/ }));
    fireEvent.click(screen.getByRole('button', { name: 'FECHAR SALA' }));
    // Back at grid: clicking another card is possible.
    expect(screen.getByRole('button', { name: /PATENTES/ })).toBeInTheDocument();
    expect(screen.queryByTestId('sede-room-sala-medalhas')).not.toBeInTheDocument();
  });

  it('calls onBack when shell footer VOLTAR is clicked at grid view', () => {
    const crew = getCrewBySlug('east-burners');
    const onBack = vi.fn();
    render(
      <SedeShell
        crew={crew}
        viewer="member"
        onBack={onBack}
        onSwitchCrew={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'VOLTAR' }));
    expect(onBack).toHaveBeenCalled();
  });

  it('calls onSwitchCrew when TROCAR CREW is clicked', () => {
    const crew = getCrewBySlug('east-burners');
    const onSwitchCrew = vi.fn();
    render(
      <SedeShell
        crew={crew}
        viewer="member"
        onBack={() => {}}
        onSwitchCrew={onSwitchCrew}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'TROCAR CREW' }));
    expect(onSwitchCrew).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test, confirm failure**

Run: `cd apps/crew-running && npx vitest run components/sede/__tests__/SedeShell.test.tsx --reporter=dot`

Expected: FAIL with `Cannot find module '../SedeShell'`.

- [ ] **Step 3: Implement `SedeShell.tsx`**

Create `apps/crew-running/components/sede/SedeShell.tsx`:

```typescript
import React, { useState } from 'react';
import type { CrewZone } from '../../data/crews';
import { SEDE_ROOMS_BY_ID, type SedeRoomId } from '../../data/sedeRooms';
import { SedeHeader } from './SedeHeader';
import { SedeRoomGrid } from './SedeRoomGrid';
import { SedeFooter } from './SedeFooter';
import { SedeRoomPlaceholder } from './SedeRoomPlaceholder';
import type { SedeViewer } from './SedeRoomCard';

type Props = {
  crew: CrewZone;
  viewer: SedeViewer;
  onBack: () => void;
  onSwitchCrew: () => void;
};

export const SedeShell: React.FC<Props> = ({ crew, viewer, onBack, onSwitchCrew }) => {
  const [activeRoom, setActiveRoom] = useState<SedeRoomId | null>(null);

  return (
    <div className="sede-shell" data-crew={crew.slug}>
      <SedeHeader crew={crew} viewer={viewer} />

      {activeRoom === null ? (
        <SedeRoomGrid onOpenRoom={setActiveRoom} viewer={viewer} />
      ) : (
        <div className="sede-room">
          <button
            type="button"
            className="game-command sede-room__close"
            onClick={() => setActiveRoom(null)}
          >
            FECHAR SALA
          </button>
          <SedeRoomPlaceholder room={SEDE_ROOMS_BY_ID[activeRoom]} />
        </div>
      )}

      <SedeFooter onBack={onBack} onSwitchCrew={onSwitchCrew} />
    </div>
  );
};
```

- [ ] **Step 4: Run test, confirm pass**

Run: `cd apps/crew-running && npx vitest run components/sede/__tests__/SedeShell.test.tsx --reporter=dot`

Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
cd "/Users/belissima/Desktop/running crew"
git add apps/crew-running/components/sede/SedeShell.tsx apps/crew-running/components/sede/__tests__/SedeShell.test.tsx
git commit -m "$(cat <<'EOF'
feat(crew-running): sede — SedeShell composition

Header + grid + footer. Internal activeRoom state pushes
SedeRoomPlaceholder when a card is opened, FECHAR SALA returns to
the grid. VOLTAR + TROCAR CREW lift to parent.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Wire MainMenu — new `'sede'` panel

**Files:**
- Modify: `apps/crew-running/components/launch/MainMenu.tsx`
- Modify: `apps/crew-running/components/launch/menu/CrewsPanel.tsx`
- Modify: `apps/crew-running/components/launch/__tests__/MainMenu.test.tsx`

**Pre-check** before editing: re-read each of the 3 files (state may have drifted from another agent's session). Run:

```bash
cd "/Users/belissima/Desktop/running crew" && git status --short -- apps/crew-running/components/launch/MainMenu.tsx apps/crew-running/components/launch/menu/CrewsPanel.tsx apps/crew-running/components/launch/__tests__/MainMenu.test.tsx
```

If any of these show ` M ` (modified by another agent) without it being your own work, **defer Task 8 and report**. Otherwise proceed.

- [ ] **Step 1: Write the failing test (extend MainMenu.test.tsx)**

Open `apps/crew-running/components/launch/__tests__/MainMenu.test.tsx` and append, inside `describe('MainMenu runner panel integration', ...)`:

```typescript
  it('opens the sede when ENTRAR NA SEDE is clicked from the CREWS PILOTO panel', () => {
    renderMenu();
    fireEvent.click(screen.getByRole('button', { name: 'CREWS PILOTO' }));
    fireEvent.click(screen.getByRole('button', { name: 'ENTRAR NA SEDE' }));
    expect(screen.getByText(/VOLTAR/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /SPONSORS/ })).toBeInTheDocument();
  });

  it('opens the sede directly via the SEDE nav rail item', () => {
    renderMenu();
    fireEvent.click(screen.getByRole('button', { name: 'SEDE' }));
    expect(screen.getByRole('button', { name: /MEDALHAS/ })).toBeInTheDocument();
  });

  it('returns from the sede to the home panel when VOLTAR is clicked', () => {
    renderMenu();
    fireEvent.click(screen.getByRole('button', { name: 'SEDE' }));
    fireEvent.click(screen.getByRole('button', { name: 'VOLTAR' }));
    // The home panel renders the GUARDA ROUPA section.
    expect(screen.getAllByText('GUARDA ROUPA').length).toBeGreaterThan(0);
  });
```

- [ ] **Step 2: Run, confirm failure**

Run: `cd apps/crew-running && npx vitest run components/launch/__tests__/MainMenu.test.tsx --reporter=dot`

Expected: FAIL with `Unable to find an accessible element with the role "button" and name "SEDE"` (or "ENTRAR NA SEDE" already worked but the sede surface text is missing).

- [ ] **Step 3: Update `MainMenu.tsx` — add `'sede'` panel + nav item**

Edit `apps/crew-running/components/launch/MainMenu.tsx`:

**3a.** Change the `MenuPanel` type (line 17) to include `'sede'`:

```typescript
type MenuPanel = 'home' | 'crews' | 'crewHome' | 'sede' | 'runner' | 'config';
```

**3b.** Add a `SedeShell` import at the top (after the existing `HomePanel` import):

```typescript
import { SedeShell } from '../sede/SedeShell';
```

**3c.** Add an `openSedePanel` handler next to `openCrewHomePanel`. Find the existing `openCrewHomePanel` (around line 148):

```typescript
  const openCrewHomePanel = () => {
    audio.play('uiSelect');
    selectPanel('crewHome');
    onOpenCrewHome();
  };
```

Add immediately below:

```typescript
  const openSedePanel = () => {
    audio.play('uiSelect');
    selectPanel('sede');
  };
```

**3d.** Add a SEDE nav rail item. Find the nav block (around line 260, the buttons row that contains `CREWS PILOTO`). After the `CREWS PILOTO` button add:

```tsx
          <button
            type="button"
            className={`game-command main-menu__nav-item--sede ${panel === 'sede' ? 'is-active' : ''}`}
            onClick={openSedePanel}
          >
            SEDE
          </button>
```

(Match the existing nav button class names — copy the structure from the neighboring `CREWS PILOTO` button to inherit `main-menu__nav-item` and any classes already used.)

**3e.** Render `<SedeShell>` when `panel === 'sede'`. Insert before the closing of the `.main-menu__panel` block (after the `panel === 'config'` block, around line 360-380):

```tsx
              {panel === 'sede' && (
                <SedeShell
                  crew={activeCrew}
                  viewer={progress.selectedCrewSlug === activeCrew.slug ? 'member' : 'visitor'}
                  onBack={() => selectPanel('home')}
                  onSwitchCrew={() => selectPanel('crews')}
                />
              )}
```

**3f.** Retarget the `CrewsPanel` prop. Find the existing usage (line 354):

```typescript
                  onOpenCrewHome={openCrewHomePanel}
```

Replace with:

```typescript
                  onOpenSede={openSedePanel}
```

- [ ] **Step 4: Update `CrewsPanel.tsx` — rename prop**

Edit `apps/crew-running/components/launch/menu/CrewsPanel.tsx`:

Change the type and destructure:

```typescript
type Props = {
  activeCrew: CrewZone;
  runnerSaved: boolean;
  guideDone: boolean;
  onSelectCrew: (slug: string) => void;
  onOpenGuide: () => void;
  onOpenSede: () => void;
  crewLocked?: boolean;
};

export const CrewsPanel: React.FC<Props> = ({
  activeCrew,
  runnerSaved,
  guideDone,
  onSelectCrew,
  onOpenGuide,
  onOpenSede,
  crewLocked = false,
}) => (
```

And inside the JSX replace `onOpenCrewHome` references with `onOpenSede`:

```tsx
    <CrewPilotPreview
      activeSlug={activeCrew.slug}
      onSelect={crewLocked ? undefined : onSelectCrew}
      onOpenActive={onOpenSede}
      disabled={crewLocked}
    />
```

```tsx
      <CartridgeButton
        variant="solid"
        className="game-command game-command--primary"
        onClick={guideDone || runnerSaved ? onOpenSede : onOpenGuide}
      >
        {guideDone || runnerSaved ? 'ENTRAR NA SEDE' : 'ABRIR GUIA'}
      </CartridgeButton>
```

- [ ] **Step 5: Run vitest, confirm test passes**

Run: `cd apps/crew-running && npx vitest run components/launch/__tests__/MainMenu.test.tsx components/sede/__tests__ --reporter=dot`

Expected: PASS for all sede tests + new MainMenu tests.

If you see a `localStorage` warning, recall the project setup: `test/setup.ts` swaps in a memory storage. Re-run with a clean Vite cache: `rm -rf node_modules/.vite node_modules/.vite-temp && npx vitest run ...`.

- [ ] **Step 6: Typecheck**

Run: `cd apps/crew-running && ./node_modules/.bin/tsc --noEmit --pretty false`

Expected: exit 0, no errors.

If TS complains that `MainMenu` test still passes `onOpenCrewHome` in its `renderMenu` defaults — note that the existing test signature in `MainMenu.test.tsx` lines 18-32 already passes `onOpenCrewHome`. Leave that prop in tests for now — it is still on the `MainMenu` Props (handler for the legacy `crewHome` panel that other UI surfaces use). Only the wiring from CrewsPanel changed.

- [ ] **Step 7: Commit**

```bash
cd "/Users/belissima/Desktop/running crew"
git add \
  apps/crew-running/components/launch/MainMenu.tsx \
  apps/crew-running/components/launch/menu/CrewsPanel.tsx \
  apps/crew-running/components/launch/__tests__/MainMenu.test.tsx
git commit -m "$(cat <<'EOF'
feat(crew-running): wire Sede shell into MainMenu

Adds a new 'sede' panel to MainMenu's panel state, a SEDE rail
nav item, and retargets the CrewsPanel ENTRAR NA SEDE button.
Visitor vs member derived from progress.selectedCrewSlug.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: CSS — `.sede-*` styles in `index.css`

**Files:**
- Modify: `apps/crew-running/index.css`

**Lock:** if another agent is currently editing `index.css` (status shows ` M  apps/crew-running/index.css`), **defer this task and stop** — `index.css` is single-agent-only per `2026-05-28-main-menu-hq-action-plan.md`.

- [ ] **Step 1: Append the sede styles to the end of `index.css`**

```css
/* === Sede da Crew (Phase 1 shell) === */

.sede-shell {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  min-height: 100%;
}

.sede-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 2px solid var(--crew-accent, #d97706);
  background: rgba(0, 0, 0, 0.6);
  position: relative;
}

.sede-header__badge {
  width: 56px;
  height: 56px;
  flex-shrink: 0;
}

.sede-header__badge img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.sede-header__copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.sede-header__eyebrow {
  font-family: 'Anton', sans-serif;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--crew-accent, #d97706);
}

.sede-header__name {
  font-family: 'Bowlby One', sans-serif;
  font-size: 22px;
  line-height: 1.1;
  color: #f5f1e6;
}

.sede-header__mission {
  font-family: 'Permanent Marker', cursive;
  font-size: 12px;
  color: rgba(245, 241, 230, 0.7);
}

.sede-header__visitor {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 2px 6px;
  font-family: 'Anton', sans-serif;
  font-size: 10px;
  letter-spacing: 0.1em;
  border: 1px solid rgba(245, 241, 230, 0.7);
  color: #f5f1e6;
}

.sede-room-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

@media (min-width: 720px) {
  .sede-room-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.sede-room-grid__cell {
  display: flex;
}

.sede-room-card {
  flex: 1;
  min-height: 96px;
  border: 2px solid rgba(245, 241, 230, 0.4);
  background: rgba(0, 0, 0, 0.5);
  color: #f5f1e6;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px;
  cursor: pointer;
  font-family: 'Anton', sans-serif;
  font-size: 13px;
  letter-spacing: 0.08em;
  transition: transform 120ms ease, border-color 120ms ease;
}

.sede-room-card:hover,
.sede-room-card:focus-visible {
  transform: translateY(-1px);
  border-color: var(--crew-accent, #d97706);
}

.sede-room-card[data-blocked='true'] {
  opacity: 0.5;
  cursor: not-allowed;
}

.sede-room-card__icon {
  width: 32px;
  height: 32px;
  border: 1px dashed rgba(245, 241, 230, 0.4);
}

.sede-room-card__lock {
  font-size: 9px;
  color: rgba(245, 241, 230, 0.7);
}

.sede-room {
  border: 2px solid rgba(245, 241, 230, 0.3);
  background: rgba(0, 0, 0, 0.55);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sede-room__close {
  align-self: flex-start;
  min-height: 44px;
}

.sede-room-placeholder {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
  color: #f5f1e6;
}

.sede-room-placeholder__eyebrow {
  font-family: 'Anton', sans-serif;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: rgba(245, 241, 230, 0.6);
}

.sede-room-placeholder__title {
  font-family: 'Bowlby One', sans-serif;
  font-size: 20px;
  margin: 0;
}

.sede-room-placeholder__copy {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: rgba(245, 241, 230, 0.8);
  margin: 0;
}

.sede-footer {
  display: flex;
  gap: 12px;
  padding-top: 8px;
  border-top: 1px solid rgba(245, 241, 230, 0.2);
}

.sede-footer__switch {
  margin-left: auto;
}

.main-menu__nav-item--sede.is-active {
  border-color: var(--crew-accent, #d97706);
}
```

- [ ] **Step 2: Visual smoke check (manual, optional in CI)**

Skip if running in a headless agent. If running locally with a dev server, open `localhost:3100`, navigate to CREWS PILOTO → ENTRAR NA SEDE, confirm:

- Header shows the crew badge + name + zone + mission.
- Grid shows 7 cards on mobile in 2 columns, on desktop 3 columns.
- Tap a card → placeholder shows, FECHAR SALA returns to grid.
- VOLTAR returns to the home panel.

- [ ] **Step 3: Commit**

```bash
cd "/Users/belissima/Desktop/running crew"
git add apps/crew-running/index.css
git commit -m "$(cat <<'EOF'
feat(crew-running): sede — index.css styles for shell + grid

Crew accent border, 2/3-column grid, 44px tap targets, FECHAR
SALA + room placeholder typography.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Phase 1 close — validate + push

- [ ] **Step 1: Run the full vitest suite**

Run: `cd apps/crew-running && npx vitest run --reporter=dot`

Expected: 0 failures. If a flaky test on cache, wipe `node_modules/.vite` and re-run per CLAUDE.md.

- [ ] **Step 2: Typecheck**

Run: `cd apps/crew-running && ./node_modules/.bin/tsc --noEmit --pretty false`

Expected: exit 0.

- [ ] **Step 3: Build**

Run: `cd apps/crew-running && npm run build`

Expected: exit 0, dist produced. Watch for asset-size warnings related to sede — none expected since Phase 1 adds no images.

- [ ] **Step 4: Full project validate command**

Run: `cd apps/crew-running && npm run validate`

Expected: contract + typecheck + tests + build + smoke all green.

- [ ] **Step 5: Push branch**

```bash
cd "/Users/belissima/Desktop/running crew"
git log --oneline feat/map-gamification..HEAD || git log --oneline -8
git push origin feat/map-gamification
```

(If `feat/map-gamification` already exists upstream and the commits land cleanly, fine. If a push protection bounces because of `--no-verify`, do not bypass — fix the underlying issue.)

- [ ] **Step 6: Open or update PR**

If a PR for `feat/map-gamification` exists, append a comment summarizing Phase 1 commits. Otherwise:

```bash
gh pr create --title "feat(crew-running): Sede da Crew — Phase 1 shell + nav" --body "$(cat <<'EOF'
## Summary
- Wires `ENTRAR NA SEDE` button to a new `'sede'` panel in MainMenu.
- Ships a 7-room shell (`SedeShell`, `SedeHeader`, `SedeRoomGrid`, `SedeRoomCard`, `SedeFooter`, `SedeRoomPlaceholder`).
- Adds `data/sedeRooms.ts` config + visitor vs member gating from `progress.selectedCrewSlug`.
- All 7 rooms render `SedeRoomPlaceholder` in Phase 1 — content lands across Phases 2-5 (see `vault/2026-05-28-sede-da-crew-spec.md`).

## Test plan
- [ ] `npm run validate` green from clean tree.
- [ ] CREWS PILOTO → ENTRAR NA SEDE renders 7 cards on mobile + desktop.
- [ ] SEDE rail item opens directly.
- [ ] Tap a card opens placeholder, FECHAR SALA returns.
- [ ] VOLTAR returns to home; TROCAR CREW navigates to CREWS PILOTO.
- [ ] Visitor (different selectedCrewSlug) shows VISITANTE chip.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Self-Review (notes from plan author)

- **Spec coverage:**
  - Spec Phase 1 task "SedeShell + Header + Footer + RoomGrid + RoomCard" → Tasks 3-7. ✓
  - "`data/sedeRooms.ts` com 7 entries" → Task 1. ✓
  - "`hooks/useSedeRoom.ts`" — **dropped** as YAGNI for Phase 1 (state lives in `SedeShell`). Add when a sibling component needs to react to room state.
  - "Wire ENTRAR NA SEDE em CrewsPanel.tsx" → Task 8 step 4. ✓
  - "Wire item SEDE no MainMenu rail" → Task 8 step 3d. ✓
  - "Visitor gate básico (flag localStorage)" → derived from existing `progress.selectedCrewSlug`, no new storage. ✓
  - "Testes vitest: SedeShell render + nav" → Task 7 + Task 8. ✓
  - "Validação: build, typecheck, smoke" → Task 10. ✓

- **Placeholder scan:** every step ships actual code or an exact command. No `TBD`/`TODO`/"implement later" in the plan content.

- **Type consistency:** `SedeRoomId`, `SedeRoomConfig`, `SedeViewer`, `SedeRoomCard.Props.onOpen` signature all referenced consistently across Tasks 1-7.

- **Notable deviations from spec for Phase 1 only:**
  - `hooks/useSedeRoom.ts` deferred (YAGNI).
  - `sedeStorage.ts` deferred (no storage needed in Phase 1; Phase 5 mural introduces it).
  - `useCrewSponsorship.ts` deferred (Phase 4 introduces it).
  - `data/sponsorshipManual.ts`, `data/patentTiers.ts`, room-specific components, `MemberCard.tsx`, `BadgeChip.tsx`, etc — out of Phase 1 scope.

If the spec is later updated to require any of the deferred items inside Phase 1, add tasks before execution.
