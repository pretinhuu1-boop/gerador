# Creator Sub-Tabs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fullscreen `CustomizeScreen` with a 4-tab sub-panel (FOTO / PERFIL / LOOK / FICHA) rendered inside the existing MainMenu RUNNER panel, so the rest of the menu nav stays reachable.

**Architecture:** Extract a new `RunnerCreatorTabs` wrapper owning state-machine + tab nav. Wrap existing inputs (PhotoUpload, RunnerProfileForm, RunnerTypePicker, WardrobePicker, SheetPreview) inside per-tab thin components. Drop duplications (CrewLockPanel, masthead, status-strip, BODY_REFERENCE row, block numbering). MainMenu `panel === 'runner'` renders `<RunnerCreatorTabs>` instead of `<RunnerPanel>` from voce/. Spec: `vault/CREATOR_DESIGN_SYSTEM.md`.

**Tech Stack:** React 19, TypeScript, Vite, Framer Motion, Vitest, Testing Library.

---

## File Structure

**New files:**
- `apps/crew-running/components/creator/RunnerCreatorTabs.tsx` — wrapper, state machine, tab nav
- `apps/crew-running/components/creator/CreatorTabNav.tsx` — tab strip with arrow-key a11y
- `apps/crew-running/components/creator/tabs/FotoTab.tsx`
- `apps/crew-running/components/creator/tabs/PerfilTab.tsx`
- `apps/crew-running/components/creator/tabs/LookTab.tsx`
- `apps/crew-running/components/creator/tabs/FichaTab.tsx`
- `apps/crew-running/components/ApiKeyModal.tsx` — extracted from CustomizeScreen
- `apps/crew-running/components/RunnerProfileForm.tsx` — extracted from CustomizeScreen, BODY_REFERENCE dropped
- `apps/crew-running/components/creator/__tests__/RunnerCreatorTabs.test.tsx`
- `apps/crew-running/components/creator/__tests__/CreatorTabNav.test.tsx`
- `apps/crew-running/components/creator/__tests__/FichaTab.test.tsx`

**Modified files:**
- `apps/crew-running/components/launch/MainMenu.tsx` — `panel === 'runner'` renders `<RunnerCreatorTabs>`
- `apps/crew-running/services/launchStorage.ts` — add `getCreatorTab` / `setCreatorTab` / `getCreatorPartial` / `setCreatorPartial`
- `apps/crew-running/services/launchStorage.test.ts` — coverage for new persisters
- `apps/crew-running/index.css` — delete dead tokens per spec §4
- `apps/crew-running/App.tsx` — RUNNER panel no longer routes to fullscreen creator
- `apps/crew-running/components/launch/CrewLaunchExperience.tsx` — drop `renderRunnerCreator` render-prop OR keep as fallback (decided in Task 9)

**Deleted files:**
- `apps/crew-running/components/CustomizeScreen.tsx` — gone after Task 10

---

## Task 1: Extract RunnerProfileForm into its own file

**Files:**
- Create: `apps/crew-running/components/RunnerProfileForm.tsx`
- Modify: `apps/crew-running/components/CustomizeScreen.tsx` — import the extracted component

This isolates form logic and drops the BODY_REFERENCE comparison row per spec §3.

- [ ] **Step 1: Create the extracted file**

```tsx
// apps/crew-running/components/RunnerProfileForm.tsx
import React from 'react';
import {
  BODY_REFERENCE,
  DEFAULT_RUNNER_PROFILE,
  RUNNER_SEX_OPTIONS,
  type RunnerProfile,
  type RunnerSex,
} from '../data/runnerProfile';
import { HandUnderline } from './SvgDefs';

type Props = {
  profile: RunnerProfile;
  onChange: (profile: RunnerProfile) => void;
};

export const RunnerProfileForm: React.FC<Props> = ({ profile, onChange }) => {
  const updateProfile = <Key extends keyof RunnerProfile>(key: Key, value: RunnerProfile[Key]) => {
    onChange({ ...profile, [key]: value });
  };
  const updateNumber = (key: 'heightCm' | 'weightKg', value: string) => {
    const parsed = Number.parseInt(value, 10);
    updateProfile(key, Number.isFinite(parsed) ? parsed : DEFAULT_RUNNER_PROFILE[key]);
  };

  return (
    <div className="runner-tab__form">
      <div className="runner-tab__section-head">
        <h3 className="section-label">FICHA DO RUNNER</h3>
        <span>base {BODY_REFERENCE.heightCm}cm / {BODY_REFERENCE.weightKg}kg</span>
      </div>
      <HandUnderline width={190} className="mb-4 mt-1" />

      <label className="runner-tab__field">
        <span>NOME</span>
        <input
          autoComplete="off"
          maxLength={24}
          onChange={(event) => updateProfile('name', event.currentTarget.value)}
          placeholder="nome do runner"
          type="text"
          value={profile.name}
        />
      </label>

      <div className="runner-tab__field">
        <span>SEXO</span>
        <div className="runner-tab__sex-options" role="group" aria-label="Sexo do runner">
          {RUNNER_SEX_OPTIONS.map((option) => (
            <button
              className={profile.sex === option.value ? 'is-selected' : ''}
              key={option.value}
              onClick={() => updateProfile('sex', option.value as RunnerSex)}
              aria-pressed={profile.sex === option.value}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="runner-tab__measure-grid">
        <label className="runner-tab__field">
          <span>ALTURA</span>
          <input
            inputMode="numeric"
            max={230}
            min={120}
            onChange={(event) => updateNumber('heightCm', event.currentTarget.value)}
            type="number"
            value={profile.heightCm}
          />
          <small>CM</small>
        </label>
        <label className="runner-tab__field">
          <span>PESO</span>
          <input
            inputMode="numeric"
            max={220}
            min={35}
            onChange={(event) => updateNumber('weightKg', event.currentTarget.value)}
            type="number"
            value={profile.weightKg}
          />
          <small>KG</small>
        </label>
      </div>

      <label className="runner-tab__field">
        <span>PERSONALIDADE</span>
        <textarea
          maxLength={120}
          onChange={(event) => updateProfile('personality', event.currentTarget.value)}
          placeholder="calmo, competitivo, caótico..."
          rows={3}
          value={profile.personality}
        />
      </label>
    </div>
  );
};
```

Note: BODY_REFERENCE comparison row is dropped per spec §3.

- [ ] **Step 2: Replace inline form in CustomizeScreen**

In `apps/crew-running/components/CustomizeScreen.tsx`, delete the `const RunnerProfileForm` inline definition (currently `~line 272-371`) and add the import:

```tsx
import { RunnerProfileForm } from './RunnerProfileForm';
```

Call site stays `<RunnerProfileForm profile={profile} onChange={handleProfileChange} />`.

- [ ] **Step 3: Run typecheck**

```bash
cd apps/crew-running && npm run typecheck
```

Expected: zero errors.

- [ ] **Step 4: Run tests**

```bash
cd apps/crew-running && npx vitest run
```

Expected: all 211 tests pass (no regressions).

- [ ] **Step 5: Commit**

```bash
git add apps/crew-running/components/RunnerProfileForm.tsx apps/crew-running/components/CustomizeScreen.tsx
git commit -m "refactor(crew-running): extract RunnerProfileForm + drop BODY_REFERENCE row"
```

---

## Task 2: Extract ApiKeyModal into its own file

**Files:**
- Create: `apps/crew-running/components/ApiKeyModal.tsx`
- Modify: `apps/crew-running/components/CustomizeScreen.tsx` — import

- [ ] **Step 1: Create the extracted file**

```tsx
// apps/crew-running/components/ApiKeyModal.tsx
import React, { useState } from 'react';
import { setApiKey } from '../services/storage';
import { CartridgeButton } from './CartridgeButton';

type Props = {
  onCancel: () => void;
  onDemo: () => void;
  onReady: (key: string) => void;
};

export const ApiKeyModal: React.FC<Props> = ({ onCancel, onDemo, onReady }) => {
  const [value, setValue] = useState('');

  const handleSave = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setApiKey(trimmed);
    onReady(trimmed);
  };

  return (
    <div className="api-key-modal" role="dialog" aria-modal="true" aria-label="Ajuste do estúdio">
      <div className="api-key-modal__panel">
        <span>ESTÚDIO INTERNO</span>
        <h2>Credencial local</h2>
        <p>Use a chave real ou rode uma sheet local para QA do fluxo.</p>
        <div className="input-wrap">
          <input
            autoFocus
            className="input-board"
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && handleSave()}
            placeholder="credencial"
            type="password"
            value={value}
          />
        </div>
        <div className="api-key-modal__actions">
          <CartridgeButton variant="chalk" onClick={onCancel}>
            VOLTAR
          </CartridgeButton>
          <CartridgeButton variant="chalk" onClick={onDemo}>
            TESTAR LOCAL
          </CartridgeButton>
          <CartridgeButton variant="solid" disabled={!value.trim()} onClick={handleSave}>
            SALVAR
          </CartridgeButton>
        </div>
        <small className="api-key-modal__hint">TESTE LOCAL NAO CHAMA GEMINI</small>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Replace inline modal in CustomizeScreen**

In `CustomizeScreen.tsx`, delete the `const ApiKeyModal` inline definition (currently `~line 221-267`) and import:

```tsx
import { ApiKeyModal } from './ApiKeyModal';
```

- [ ] **Step 3: Typecheck + tests**

```bash
cd apps/crew-running && npm run typecheck && npx vitest run
```

Expected: zero errors, 211 tests pass.

- [ ] **Step 4: Commit**

```bash
git add apps/crew-running/components/ApiKeyModal.tsx apps/crew-running/components/CustomizeScreen.tsx
git commit -m "refactor(crew-running): extract ApiKeyModal into shared component"
```

---

## Task 3: Add creator-state persisters in launchStorage

**Files:**
- Modify: `apps/crew-running/services/launchStorage.ts`
- Modify: `apps/crew-running/services/launchStorage.test.ts`

- [ ] **Step 1: Write failing test**

Add to `apps/crew-running/services/launchStorage.test.ts`:

```ts
describe('Creator tab persistence', () => {
  it('returns null when no creator tab stored', () => {
    expect(getCreatorTab()).toBeNull();
  });

  it('persists and restores creator tab', () => {
    setCreatorTab('look');
    expect(getCreatorTab()).toBe('look');
  });

  it('ignores corrupt tab value', () => {
    window.localStorage.setItem('crewCreatorTab', 'garbage');
    expect(getCreatorTab()).toBeNull();
  });
});
```

Also add the import at top:

```ts
import { getCreatorTab, setCreatorTab } from './launchStorage';
```

Add `getCreatorTab` and `setCreatorTab` to the destructured import in the existing `const { ... } = await import('./launchStorage')` block.

- [ ] **Step 2: Run test, expect failure**

```bash
cd apps/crew-running && npx vitest run services/launchStorage.test.ts
```

Expected: 3 new test failures referencing `getCreatorTab`/`setCreatorTab`.

- [ ] **Step 3: Implement persisters**

In `apps/crew-running/services/launchStorage.ts`, add at the end of `STORAGE_KEYS`:

```ts
const STORAGE_KEYS = {
  // ...existing keys
  creatorTab: 'crewCreatorTab',
} as const;
```

And append:

```ts
export type CreatorTabId = 'foto' | 'perfil' | 'look' | 'ficha';

const VALID_CREATOR_TABS: ReadonlySet<CreatorTabId> = new Set([
  'foto', 'perfil', 'look', 'ficha',
]);

export const getCreatorTab = (): CreatorTabId | null => {
  const raw = readString(STORAGE_KEYS.creatorTab);
  return VALID_CREATOR_TABS.has(raw as CreatorTabId) ? (raw as CreatorTabId) : null;
};

export const setCreatorTab = (tab: CreatorTabId): void =>
  writeString(STORAGE_KEYS.creatorTab, tab);
```

- [ ] **Step 4: Run test, expect pass**

```bash
cd apps/crew-running && npx vitest run services/launchStorage.test.ts
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/crew-running/services/launchStorage.ts apps/crew-running/services/launchStorage.test.ts
git commit -m "feat(crew-running): persist creator tab selection"
```

---

## Task 4: Create CreatorTabNav with arrow-key a11y

**Files:**
- Create: `apps/crew-running/components/creator/CreatorTabNav.tsx`
- Create: `apps/crew-running/components/creator/__tests__/CreatorTabNav.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// apps/crew-running/components/creator/__tests__/CreatorTabNav.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CreatorTabNav } from '../CreatorTabNav';

const TABS = [
  { id: 'foto', label: 'FOTO' },
  { id: 'perfil', label: 'PERFIL' },
  { id: 'look', label: 'LOOK' },
  { id: 'ficha', label: 'FICHA' },
] as const;

describe('CreatorTabNav', () => {
  it('renders 4 tabs with active state', () => {
    render(<CreatorTabNav tabs={TABS} active="perfil" onSelect={() => {}} />);
    expect(screen.getByRole('tab', { name: 'PERFIL' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'FOTO' })).toHaveAttribute('aria-selected', 'false');
  });

  it('fires onSelect on click', () => {
    const onSelect = vi.fn();
    render(<CreatorTabNav tabs={TABS} active="foto" onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('tab', { name: 'LOOK' }));
    expect(onSelect).toHaveBeenCalledWith('look');
  });

  it('arrow-right moves selection right, wraps at end', () => {
    const onSelect = vi.fn();
    render(<CreatorTabNav tabs={TABS} active="ficha" onSelect={onSelect} />);
    fireEvent.keyDown(screen.getByRole('tab', { name: 'FICHA' }), { key: 'ArrowRight' });
    expect(onSelect).toHaveBeenCalledWith('foto');
  });

  it('arrow-left moves selection left, wraps at start', () => {
    const onSelect = vi.fn();
    render(<CreatorTabNav tabs={TABS} active="foto" onSelect={onSelect} />);
    fireEvent.keyDown(screen.getByRole('tab', { name: 'FOTO' }), { key: 'ArrowLeft' });
    expect(onSelect).toHaveBeenCalledWith('ficha');
  });
});
```

- [ ] **Step 2: Run test, expect failure**

```bash
cd apps/crew-running && npx vitest run components/creator
```

Expected: file-not-found error for `../CreatorTabNav`.

- [ ] **Step 3: Implement component**

```tsx
// apps/crew-running/components/creator/CreatorTabNav.tsx
import React from 'react';
import { audio } from '../../services/audio';

export type CreatorTabDef<Id extends string> = {
  id: Id;
  label: string;
};

type Props<Id extends string> = {
  tabs: ReadonlyArray<CreatorTabDef<Id>>;
  active: Id;
  onSelect: (id: Id) => void;
};

export function CreatorTabNav<Id extends string>({ tabs, active, onSelect }: Props<Id>) {
  const handleKey = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const idx = tabs.findIndex((t) => t.id === active);
    if (idx < 0) return;
    const next = event.key === 'ArrowRight'
      ? tabs[(idx + 1) % tabs.length]
      : tabs[(idx - 1 + tabs.length) % tabs.length];
    audio.playSfx('nav-slab');
    onSelect(next.id);
  };

  const handleClick = (id: Id) => {
    if (id === active) return;
    audio.playSfx('nav-slab');
    onSelect(id);
  };

  return (
    <div className="runner-tab__nav" role="tablist" aria-label="Etapas do criador">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          type="button"
          aria-selected={tab.id === active}
          tabIndex={tab.id === active ? 0 : -1}
          className={`runner-tab__nav-item ${tab.id === active ? 'is-active' : ''}`}
          onClick={() => handleClick(tab.id)}
          onKeyDown={handleKey}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run test, expect pass**

```bash
cd apps/crew-running && npx vitest run components/creator
```

Expected: 4 tests pass.

- [ ] **Step 5: Add CSS tokens**

In `apps/crew-running/index.css`, add:

```css
.runner-tab__nav {
  display: flex;
  gap: 4px;
  border-bottom: 2px solid var(--crew-accent, #f4a52c);
  margin-bottom: 16px;
  padding-bottom: 8px;
}
.runner-tab__nav-item {
  padding: 8px 14px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: var(--cream-ink, #e8e2d2);
  font-family: inherit;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: background 120ms ease;
}
.runner-tab__nav-item.is-active {
  background: var(--crew-accent, #f4a52c);
  color: #000;
  border-color: var(--crew-accent, #f4a52c);
}
.runner-tab__nav-item:focus-visible {
  outline: 2px solid var(--cream-ink, #e8e2d2);
  outline-offset: 2px;
}
```

- [ ] **Step 6: Commit**

```bash
git add apps/crew-running/components/creator/CreatorTabNav.tsx \
        apps/crew-running/components/creator/__tests__/CreatorTabNav.test.tsx \
        apps/crew-running/index.css
git commit -m "feat(crew-running): CreatorTabNav with arrow-key a11y"
```

---

## Task 5: Create thin tab components (FotoTab, PerfilTab, LookTab)

**Files:**
- Create: `apps/crew-running/components/creator/tabs/FotoTab.tsx`
- Create: `apps/crew-running/components/creator/tabs/PerfilTab.tsx`
- Create: `apps/crew-running/components/creator/tabs/LookTab.tsx`

These wrap existing inputs with tab-friendly markup. No new behavior, just structure.

- [ ] **Step 1: Create FotoTab**

```tsx
// apps/crew-running/components/creator/tabs/FotoTab.tsx
import React from 'react';
import { PhotoUpload } from '../../PhotoUpload';
import type { PhotoInput } from '../../../services/crewService';

type Photo = PhotoInput & { previewUrl: string };

type Props = {
  photo: Photo | null;
  onChange: (next: Photo | null) => void;
};

export const FotoTab: React.FC<Props> = ({ photo, onChange }) => (
  <section role="tabpanel" aria-labelledby="creator-tab-foto" className="runner-tab__section">
    <PhotoUpload photo={photo} onChange={onChange} />
  </section>
);
```

- [ ] **Step 2: Create PerfilTab**

```tsx
// apps/crew-running/components/creator/tabs/PerfilTab.tsx
import React from 'react';
import { RunnerProfileForm } from '../../RunnerProfileForm';
import type { RunnerProfile } from '../../../data/runnerProfile';

type Props = {
  profile: RunnerProfile;
  onChange: (profile: RunnerProfile) => void;
};

export const PerfilTab: React.FC<Props> = ({ profile, onChange }) => (
  <section role="tabpanel" aria-labelledby="creator-tab-perfil" className="runner-tab__section">
    <RunnerProfileForm profile={profile} onChange={onChange} />
  </section>
);
```

- [ ] **Step 3: Create LookTab**

```tsx
// apps/crew-running/components/creator/tabs/LookTab.tsx
import React from 'react';
import { RunnerTypePicker } from '../../RunnerTypePicker';
import { WardrobePicker } from '../../WardrobePicker';
import { CartridgeButton } from '../../CartridgeButton';
import type { RunnerType } from '../../../data/runnerTypes';
import type { SlotSelection } from '../../../services/crewService';
import type { SlotKey } from '../../../data/wardrobe';

type Props = {
  runnerType: RunnerType;
  onSelectType: (type: RunnerType) => void;
  locked: SlotSelection;
  onToggleSlot: (slot: SlotKey, itemId: string) => void;
  mixCount: number;
  onRandomize: () => void;
  canCreate: boolean;
  loading: boolean;
  onCreate: () => void;
};

export const LookTab: React.FC<Props> = ({
  runnerType, onSelectType,
  locked, onToggleSlot,
  mixCount, onRandomize,
  canCreate, loading, onCreate,
}) => (
  <section role="tabpanel" aria-labelledby="creator-tab-look" className="runner-tab__section">
    <RunnerTypePicker selected={runnerType} onSelect={onSelectType} />
    <WardrobePicker locked={locked} onToggle={onToggleSlot} />
    <div className="runner-tab__action-bar" aria-label="Comandos do runner">
      <div className="runner-tab__mix-control">
        <CartridgeButton
          variant="chalk"
          className="game-command"
          onClick={onRandomize}
          aria-label="Misturar equipamento"
        >
          MISTURAR LOOK
        </CartridgeButton>
        <div className="runner-tab__mix-stamp" aria-live="polite">
          {mixCount > 0
            ? `LOOK ${String(mixCount).padStart(2, '0')} MISTURADO`
            : 'TOQUE PARA VARIAR EQUIPAMENTO'}
        </div>
      </div>
      <CartridgeButton
        variant="solid"
        className={`game-command game-command--primary ${loading ? 'is-loading' : ''}`}
        onClick={onCreate}
        disabled={!canCreate}
        loading={loading}
      >
        {loading ? 'CREW STUDIO...' : 'CRIAR RUNNER'}
      </CartridgeButton>
    </div>
  </section>
);
```

- [ ] **Step 4: Typecheck**

```bash
cd apps/crew-running && npm run typecheck
```

Expected: zero errors.

- [ ] **Step 5: Commit**

```bash
git add apps/crew-running/components/creator/tabs/
git commit -m "feat(crew-running): creator FotoTab + PerfilTab + LookTab shells"
```

---

## Task 6: Create FichaTab with state-driven rendering + test

**Files:**
- Create: `apps/crew-running/components/creator/tabs/FichaTab.tsx`
- Create: `apps/crew-running/components/creator/__tests__/FichaTab.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// apps/crew-running/components/creator/__tests__/FichaTab.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FichaTab } from '../tabs/FichaTab';
import { CREWS } from '../../../data/crews';
import type { GenerateResult } from '../../../services/crewService';

const crew = CREWS[0];

describe('FichaTab', () => {
  it('shows empty checklist when no progress', () => {
    render(
      <FichaTab
        crew={crew}
        hasPhoto={false}
        hasName={false}
        runnerSaved={false}
        savedCharacter={null}
        savedAtLabel="PENDENTE"
        runnerName="Runner"
        runnerTypeLabel="A DEFINIR"
        passportStyle={{}}
        result={null}
        loading={false}
        error={null}
        savingVariantIndex={null}
        onSaveVariant={() => {}}
        onAdjust={() => {}}
      />
    );
    expect(screen.getByText(/FOTO PENDENTE/)).toBeInTheDocument();
    expect(screen.getByText(/PERFIL PENDENTE/)).toBeInTheDocument();
  });

  it('shows passport when runner saved', () => {
    render(
      <FichaTab
        crew={crew}
        hasPhoto={true}
        hasName={true}
        runnerSaved={true}
        savedCharacter={{
          imageDataUrl: 'data:image/png;base64,iVBORw0KGgo=',
          profile: { name: 'NINA', sex: 'female', heightCm: 170, weightKg: 70, personality: '' },
          crewSlug: crew.slug,
          runnerTypeId: 'sprint',
          slots: { top: 'a', bottom: 'b', shoes: 'c', accessory: 'd' },
          savedAt: Date.now(),
        }}
        savedAtLabel="28/05"
        runnerName="NINA"
        runnerTypeLabel="Sprint"
        passportStyle={{}}
        result={null}
        loading={false}
        error={null}
        savingVariantIndex={null}
        onSaveVariant={() => {}}
        onAdjust={vi.fn()}
      />
    );
    expect(screen.getByText('NINA')).toBeInTheDocument();
    expect(screen.getByText(/IDENTIDADE SALVA/)).toBeInTheDocument();
  });

  it('shows SheetPreview when generation result present and not saved', () => {
    const result: GenerateResult = {
      imageDataUrl: 'data:image/png;base64,abc',
      variants: [
        { index: 0, slots: { top: { id: 'a', label: 'A', prompt: '', iconUrl: '' }, bottom: { id: 'b', label: 'B', prompt: '', iconUrl: '' }, shoes: { id: 'c', label: 'C', prompt: '', iconUrl: '' }, accessory: { id: 'd', label: 'D', prompt: '', iconUrl: '' } } },
      ] as any,
    };
    render(
      <FichaTab
        crew={crew}
        hasPhoto={true}
        hasName={true}
        runnerSaved={false}
        savedCharacter={null}
        savedAtLabel="PENDENTE"
        runnerName="Runner"
        runnerTypeLabel="Sprint"
        passportStyle={{}}
        result={result}
        loading={false}
        error={null}
        savingVariantIndex={null}
        onSaveVariant={() => {}}
        onAdjust={() => {}}
      />
    );
    expect(screen.getByText(/Escolhe teu look/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test, expect failure (file missing)**

```bash
cd apps/crew-running && npx vitest run components/creator/__tests__/FichaTab.test.tsx
```

- [ ] **Step 3: Implement FichaTab**

```tsx
// apps/crew-running/components/creator/tabs/FichaTab.tsx
import React from 'react';
import { CartridgeButton } from '../../CartridgeButton';
import { CrewBadge } from '../../CrewBadge';
import { SheetPreview } from '../../SheetPreview';
import type { CrewZone } from '../../../data/crews';
import type { SavedCharacter } from '../../../services/storage';
import type { GenerateResult, SheetVariant } from '../../../services/crewService';

type Props = {
  crew: CrewZone;
  hasPhoto: boolean;
  hasName: boolean;
  runnerSaved: boolean;
  savedCharacter: SavedCharacter | null;
  savedAtLabel: string;
  runnerName: string;
  runnerTypeLabel: string;
  passportStyle: React.CSSProperties;
  result: GenerateResult | null;
  loading: boolean;
  error: string | null;
  savingVariantIndex: SheetVariant['index'] | null;
  onSaveVariant: (variant: SheetVariant) => void | Promise<void>;
  onAdjust: () => void;
};

export const FichaTab: React.FC<Props> = ({
  crew,
  hasPhoto, hasName,
  runnerSaved, savedCharacter,
  savedAtLabel, runnerName, runnerTypeLabel,
  passportStyle,
  result, loading, error, savingVariantIndex, onSaveVariant,
  onAdjust,
}) => {
  if (runnerSaved && savedCharacter) {
    return (
      <section
        role="tabpanel"
        aria-labelledby="creator-tab-ficha"
        className="runner-tab__section runner-tab__passport"
        style={passportStyle}
      >
        <div className="runner-tab__passport-head">
          <span>IDENTIDADE SALVA</span>
          <strong>{runnerName}</strong>
          <CrewBadge crew={crew} size="md" />
        </div>
        <img
          className="runner-tab__passport-figure"
          src={savedCharacter.imageDataUrl}
          alt={`Runner ${runnerName}`}
        />
        <div className="runner-tab__passport-grid">
          <span>CREW</span><strong>{crew.zone}</strong>
          <span>TIPO</span><strong>{runnerTypeLabel}</strong>
          <span>LOOK</span><strong>READY</strong>
          <span>ID</span><strong>{savedAtLabel}</strong>
        </div>
        <CartridgeButton variant="chalk" className="game-command" onClick={onAdjust}>
          AJUSTAR RUNNER
        </CartridgeButton>
      </section>
    );
  }

  if (result && !loading) {
    return (
      <section
        role="tabpanel"
        aria-labelledby="creator-tab-ficha"
        className="runner-tab__section"
      >
        <h3 className="section-label">Escolhe teu look</h3>
        <SheetPreview
          result={result}
          loading={loading}
          error={error}
          savingVariantIndex={savingVariantIndex}
          onSave={onSaveVariant}
        />
      </section>
    );
  }

  // Empty state: checklist
  const items: Array<[string, boolean]> = [
    ['FOTO', hasPhoto],
    ['PERFIL', hasName],
    ['LOOK', false],
  ];

  return (
    <section
      role="tabpanel"
      aria-labelledby="creator-tab-ficha"
      className="runner-tab__section runner-tab__checklist"
    >
      <h3 className="section-label">PRONTO PRA SAIR DA CASA</h3>
      <ul aria-label="Checklist de prontidão">
        {items.map(([label, done]) => (
          <li key={label} className={done ? 'is-done' : ''}>
            <span aria-hidden>{done ? '✓' : '○'}</span>
            {label} {done ? '✓' : 'PENDENTE'}
          </li>
        ))}
      </ul>
      <p className="runner-tab__checklist-hint">
        {!hasPhoto || !hasName
          ? 'Sobe foto e nome nas abas FOTO e PERFIL.'
          : 'Escolhe o tipo e equipamento na aba LOOK, depois CRIAR RUNNER.'}
      </p>
    </section>
  );
};
```

- [ ] **Step 4: Run test, expect pass**

```bash
cd apps/crew-running && npx vitest run components/creator/__tests__/FichaTab.test.tsx
```

Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/crew-running/components/creator/tabs/FichaTab.tsx \
        apps/crew-running/components/creator/__tests__/FichaTab.test.tsx
git commit -m "feat(crew-running): FichaTab with empty / preview / passport states"
```

---

## Task 7: Create RunnerCreatorTabs wrapper with state machine + test

**Files:**
- Create: `apps/crew-running/components/creator/RunnerCreatorTabs.tsx`
- Create: `apps/crew-running/components/creator/__tests__/RunnerCreatorTabs.test.tsx`

The wrapper holds all current CustomizeScreen state (photo, profile, runnerType, locked, result, savingVariantIndex, mixCount, needsApiKey) and exposes tab nav.

- [ ] **Step 1: Write smoke test (single)**

```tsx
// apps/crew-running/components/creator/__tests__/RunnerCreatorTabs.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RunnerCreatorTabs } from '../RunnerCreatorTabs';
import { CREWS } from '../../../data/crews';

describe('RunnerCreatorTabs', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders 4 tab buttons + defaults to FOTO when no saved tab', () => {
    render(
      <RunnerCreatorTabs
        crew={CREWS[0]}
        apiKey=""
        onApiKeyReady={() => {}}
        onSaved={() => {}}
      />
    );
    expect(screen.getByRole('tab', { name: 'FOTO' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'PERFIL' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'LOOK' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'FICHA' })).toBeInTheDocument();
  });

  it('switches tab on click and persists selection', () => {
    render(
      <RunnerCreatorTabs
        crew={CREWS[0]}
        apiKey=""
        onApiKeyReady={() => {}}
        onSaved={() => {}}
      />
    );
    fireEvent.click(screen.getByRole('tab', { name: 'LOOK' }));
    expect(screen.getByRole('tab', { name: 'LOOK' })).toHaveAttribute('aria-selected', 'true');
    expect(window.localStorage.getItem('crewCreatorTab')).toBe('look');
  });
});
```

- [ ] **Step 2: Run test, expect failure (file missing)**

```bash
cd apps/crew-running && npx vitest run components/creator/__tests__/RunnerCreatorTabs.test.tsx
```

- [ ] **Step 3: Implement RunnerCreatorTabs**

```tsx
// apps/crew-running/components/creator/RunnerCreatorTabs.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { buildCrewRenderContext } from '../../data/crewRenderContext';
import {
  DEFAULT_RUNNER_PROFILE,
  type RunnerProfile,
  normalizeRunnerProfile,
} from '../../data/runnerProfile';
import { DEFAULT_RUNNER_TYPE, type RunnerType, getRunnerTypeById } from '../../data/runnerTypes';
import { WARDROBE, type SlotKey } from '../../data/wardrobe';
import {
  type GenerateResult,
  type PhotoInput,
  type SheetVariant,
  type SlotSelection,
  generateCharacterSheet,
  generateDemoCharacterSheet,
} from '../../services/crewService';
import type { SavedCharacter } from '../../services/storage';
import { getApiKey, getSavedCharacter, saveCharacter } from '../../services/storage';
import {
  getCreatorTab,
  setCreatorTab,
  type CreatorTabId,
} from '../../services/launchStorage';
import { appendIdentityEvent } from '../../data/identityEvents';
import { audio } from '../../services/audio';
import type { CrewZone } from '../../data/crews';
import { ApiKeyModal } from '../ApiKeyModal';
import { CrewBadge } from '../CrewBadge';
import { CreatorTabNav, type CreatorTabDef } from './CreatorTabNav';
import { FotoTab } from './tabs/FotoTab';
import { PerfilTab } from './tabs/PerfilTab';
import { LookTab } from './tabs/LookTab';
import { FichaTab } from './tabs/FichaTab';

type Photo = PhotoInput & { previewUrl: string };

type Props = {
  crew: CrewZone;
  apiKey: string;
  onApiKeyReady: (key: string) => void;
  onSaved: () => void;
};

const TABS: ReadonlyArray<CreatorTabDef<CreatorTabId>> = [
  { id: 'foto', label: 'FOTO' },
  { id: 'perfil', label: 'PERFIL' },
  { id: 'look', label: 'LOOK' },
  { id: 'ficha', label: 'FICHA' },
];

const randomFrom = <Value,>(items: Value[]): Value =>
  items[Math.floor(Math.random() * items.length)];

const loadImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Não foi possível ler esse look.'));
    img.src = url;
  });

const cropVariantFromSheet = (imageDataUrl: string, variantIndex: SheetVariant['index']) =>
  loadImage(imageDataUrl).then((image) => {
    const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
    const cellSize = sourceSize / 2;
    const trim = cellSize * 0.035;
    const cropSize = cellSize - trim * 2;
    const column = variantIndex % 2;
    const row = Math.floor(variantIndex / 2);
    const sourceX = (image.naturalWidth - sourceSize) / 2 + column * cellSize + trim;
    const sourceY = (image.naturalHeight - sourceSize) / 2 + row * cellSize + trim;
    const outputSize = Math.floor(cellSize);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context || outputSize <= 0 || cropSize <= 0) {
      throw new Error('Não foi possível salvar esse look.');
    }
    canvas.width = outputSize;
    canvas.height = outputSize;
    context.drawImage(image, sourceX, sourceY, cropSize, cropSize, 0, 0, outputSize, outputSize);
    return canvas.toDataURL('image/png');
  });

export const RunnerCreatorTabs: React.FC<Props> = ({
  crew,
  apiKey,
  onApiKeyReady,
  onSaved,
}) => {
  const [activeTab, setActiveTab] = useState<CreatorTabId>(() => getCreatorTab() ?? 'foto');
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [profile, setProfile] = useState<RunnerProfile>(DEFAULT_RUNNER_PROFILE);
  const [runnerType, setRunnerType] = useState<RunnerType>(DEFAULT_RUNNER_TYPE);
  const [locked, setLocked] = useState<SlotSelection>({});
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [generatedProfile, setGeneratedProfile] = useState<RunnerProfile | null>(null);
  const [generatedRunnerType, setGeneratedRunnerType] = useState<RunnerType | null>(null);
  const [generatedCrewSlug, setGeneratedCrewSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingVariantIndex, setSavingVariantIndex] = useState<SheetVariant['index'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsApiKey, setNeedsApiKey] = useState(false);
  const [mixCount, setMixCount] = useState(0);
  const generationRequestRef = useRef(0);

  const savedCharacter = useMemo(() => getSavedCharacter(), [result]);
  const runnerSaved = Boolean(savedCharacter?.imageDataUrl);
  const crewContext = useMemo(() => buildCrewRenderContext(crew.slug), [crew.slug]);
  const runnerTypeLabel = getRunnerTypeById(savedCharacter?.runnerTypeId).label;
  const savedAtLabel = savedCharacter?.savedAt
    ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(savedCharacter.savedAt)
    : 'PENDENTE';
  const passportStyle: React.CSSProperties = {
    '--crew-accent': crew.accent,
    '--crew-secondary': crew.secondary,
    backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.38), rgba(0,0,0,0.82)), url(${crew.assets.banner})`,
  } as React.CSSProperties;

  const normalizedProfile = useMemo(() => normalizeRunnerProfile(profile), [profile]);
  const hasName = Boolean(normalizedProfile.name);
  const hasPhoto = Boolean(photo);
  const canCreate = hasPhoto && hasName;

  const clearResult = () => {
    generationRequestRef.current += 1;
    setResult(null);
    setGeneratedProfile(null);
    setGeneratedRunnerType(null);
    setGeneratedCrewSlug(null);
    setError(null);
    setLoading(false);
    setSavingVariantIndex(null);
  };

  useEffect(() => {
    setLocked({});
    setMixCount(0);
    clearResult();
  }, [crew.slug]);

  const switchTab = (next: CreatorTabId) => {
    if (next === activeTab) return;
    setActiveTab(next);
    setCreatorTab(next);
  };

  const handlePhotoChange = (next: Photo | null) => {
    setPhoto(next);
    clearResult();
  };

  const handleProfileChange = (next: RunnerProfile) => {
    setProfile(next);
    clearResult();
  };

  const handleTypeSelect = (next: RunnerType) => {
    setRunnerType(next);
    clearResult();
  };

  const handleToggleSlot = (slot: SlotKey, itemId: string) => {
    setLocked((prev) => {
      const update = { ...prev };
      if (update[slot] === itemId) delete update[slot];
      else update[slot] = itemId;
      return update;
    });
    clearResult();
  };

  const handleRandomize = () => {
    const next: SlotSelection = {
      top: randomFrom(WARDROBE.top).id,
      bottom: randomFrom(WARDROBE.bottom).id,
      shoes: randomFrom(WARDROBE.shoes).id,
      accessory: randomFrom(WARDROBE.accessory).id,
    };
    audio.playSfx('randomize-roll');
    setLocked(next);
    setMixCount((c) => c + 1);
    clearResult();
  };

  const runGen = async (fn: () => Promise<GenerateResult>) => {
    if (!hasPhoto) { setError('Envie uma foto do rosto do runner.'); return; }
    if (!hasName) { setError('Dê um nome ao runner.'); return; }
    const requestId = generationRequestRef.current + 1;
    generationRequestRef.current = requestId;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fn();
      if (generationRequestRef.current !== requestId) return;
      setResult(res);
      setGeneratedProfile(normalizedProfile);
      setGeneratedRunnerType(runnerType);
      setGeneratedCrewSlug(crew.slug);
      switchTab('ficha');
    } catch (err) {
      if (generationRequestRef.current !== requestId) return;
      audio.playSfx('error-buzz');
      setError(err instanceof Error ? err.message : 'Falha ao criar runner.');
    } finally {
      if (generationRequestRef.current === requestId) setLoading(false);
    }
  };

  const handleCreate = () => {
    if (!apiKey) { setNeedsApiKey(true); return; }
    if (!photo) return;
    void runGen(() => generateCharacterSheet({
      apiKey,
      photo: { base64: photo.base64, mimeType: photo.mimeType },
      profile: normalizedProfile,
      runnerType,
      crewContext,
      locked,
    }));
  };

  const handleCreateDemo = () => {
    setNeedsApiKey(false);
    if (!photo) return;
    void runGen(() => generateDemoCharacterSheet({
      photo: { base64: photo.base64, mimeType: photo.mimeType },
      profile: normalizedProfile,
      runnerType,
      crewContext,
      locked,
    }));
  };

  const handleSaveVariant = async (variant: SheetVariant) => {
    if (!result) return;
    setSavingVariantIndex(variant.index);
    setError(null);
    try {
      const croppedImageDataUrl = await cropVariantFromSheet(result.imageDataUrl, variant.index);
      const next: SavedCharacter = {
        imageDataUrl: croppedImageDataUrl,
        profile: generatedProfile ?? normalizedProfile,
        crewSlug: generatedCrewSlug ?? crew.slug,
        runnerTypeId: (generatedRunnerType ?? runnerType).id,
        renderStyleId: 'street-v2',
        slots: {
          top: variant.slots.top.id,
          bottom: variant.slots.bottom.id,
          shoes: variant.slots.shoes.id,
          accessory: variant.slots.accessory.id,
        },
        savedAt: Date.now(),
        backgroundRemoved: true,
      };
      saveCharacter(next);
      appendIdentityEvent({
        kind: 'LOOK_SAVED',
        payload: {
          crewSlug: next.crewSlug,
          runnerTypeId: next.runnerTypeId,
          runnerName: next.profile?.name,
          slots: next.slots,
          savedAt: next.savedAt,
          lookIndex: variant.index,
        },
        timestamp: next.savedAt,
      });
      audio.playSfx('equip-snap');
      setSavingVariantIndex(null);
      onSaved();
    } catch (err) {
      audio.playSfx('error-buzz');
      setError(err instanceof Error ? err.message : 'Não foi possível salvar esse look.');
      setSavingVariantIndex(null);
    }
  };

  const handleAdjust = () => {
    switchTab('look');
  };

  return (
    <div className="runner-tab" style={{ '--crew-accent': crew.accent } as React.CSSProperties}>
      <div className="runner-tab__header">
        <CreatorTabNav tabs={TABS} active={activeTab} onSelect={switchTab} />
        <div className="runner-tab__crew-chip" aria-label={`Crew ${crew.name}`}>
          <CrewBadge crew={crew} size="sm" />
          <span>{crew.zone}</span>
        </div>
      </div>

      {activeTab === 'foto' && (
        <FotoTab photo={photo} onChange={handlePhotoChange} />
      )}
      {activeTab === 'perfil' && (
        <PerfilTab profile={profile} onChange={handleProfileChange} />
      )}
      {activeTab === 'look' && (
        <LookTab
          runnerType={runnerType}
          onSelectType={handleTypeSelect}
          locked={locked}
          onToggleSlot={handleToggleSlot}
          mixCount={mixCount}
          onRandomize={handleRandomize}
          canCreate={canCreate}
          loading={loading}
          onCreate={handleCreate}
        />
      )}
      {activeTab === 'ficha' && (
        <FichaTab
          crew={crew}
          hasPhoto={hasPhoto}
          hasName={hasName}
          runnerSaved={runnerSaved}
          savedCharacter={savedCharacter}
          savedAtLabel={savedAtLabel}
          runnerName={savedCharacter?.profile?.name || 'Runner'}
          runnerTypeLabel={runnerTypeLabel}
          passportStyle={passportStyle}
          result={result}
          loading={loading}
          error={error}
          savingVariantIndex={savingVariantIndex}
          onSaveVariant={handleSaveVariant}
          onAdjust={handleAdjust}
        />
      )}

      {needsApiKey && (
        <ApiKeyModal
          onCancel={() => { onApiKeyReady(getApiKey()); setNeedsApiKey(false); }}
          onDemo={handleCreateDemo}
          onReady={(k) => { onApiKeyReady(k); setNeedsApiKey(false); }}
        />
      )}
    </div>
  );
};
```

- [ ] **Step 4: Add wrapper CSS**

Append to `apps/crew-running/index.css`:

```css
.runner-tab { display: flex; flex-direction: column; gap: 16px; }
.runner-tab__header { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; }
.runner-tab__crew-chip { display: flex; align-items: center; gap: 6px; font-size: 12px; opacity: 0.85; }
.runner-tab__section { display: flex; flex-direction: column; gap: 14px; }
.runner-tab__form { display: flex; flex-direction: column; gap: 12px; }
.runner-tab__section-head { display: flex; justify-content: space-between; align-items: baseline; }
.runner-tab__field { display: flex; flex-direction: column; gap: 4px; font-size: 14px; }
.runner-tab__field input, .runner-tab__field textarea { padding: 8px; background: rgba(0,0,0,0.45); color: var(--cream-ink, #e8e2d2); border: 1px solid rgba(255,255,255,0.18); }
.runner-tab__sex-options { display: flex; gap: 4px; }
.runner-tab__sex-options button { padding: 6px 10px; border: 1px solid rgba(255,255,255,0.18); background: transparent; color: var(--cream-ink, #e8e2d2); }
.runner-tab__sex-options button.is-selected { background: var(--crew-accent, #f4a52c); color: #000; }
.runner-tab__measure-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.runner-tab__action-bar { display: flex; justify-content: space-between; gap: 12px; padding: 8px 0; position: sticky; bottom: 0; background: rgba(0,0,0,0.7); }
.runner-tab__mix-control { display: flex; flex-direction: column; gap: 4px; }
.runner-tab__mix-stamp { font-size: 11px; opacity: 0.7; }
.runner-tab__passport { padding: 16px; background-size: cover; }
.runner-tab__passport-head { display: flex; flex-direction: column; gap: 4px; }
.runner-tab__passport-figure { width: 100%; max-width: 240px; align-self: center; }
.runner-tab__passport-grid { display: grid; grid-template-columns: auto 1fr; gap: 4px 12px; font-size: 12px; }
.runner-tab__checklist ul { list-style: none; padding: 0; }
.runner-tab__checklist li { padding: 6px 0; font-family: 'JetBrains Mono', monospace; }
.runner-tab__checklist li.is-done { opacity: 0.5; text-decoration: line-through; }
.runner-tab__checklist-hint { font-size: 13px; opacity: 0.85; margin-top: 8px; }
```

- [ ] **Step 5: Run test, expect pass**

```bash
cd apps/crew-running && npx vitest run components/creator/__tests__/RunnerCreatorTabs.test.tsx
```

Expected: 2 tests pass.

- [ ] **Step 6: Run full suite**

```bash
cd apps/crew-running && npx vitest run
```

Expected: all tests pass (211 + 2 + 3 + 4 = 220).

- [ ] **Step 7: Commit**

```bash
git add apps/crew-running/components/creator/RunnerCreatorTabs.tsx \
        apps/crew-running/components/creator/__tests__/RunnerCreatorTabs.test.tsx \
        apps/crew-running/index.css
git commit -m "feat(crew-running): RunnerCreatorTabs wrapper with state machine"
```

---

## Task 8: Wire RunnerCreatorTabs into MainMenu RUNNER panel

**Files:**
- Modify: `apps/crew-running/components/launch/MainMenu.tsx`

Currently `panel === 'runner'` renders `<RunnerPanel ...>` from voce/. Replace with `<RunnerCreatorTabs>` (the voce RunnerPanel becomes the post-MVP F1 feature, kept in code but unused by MainMenu).

- [ ] **Step 1: Modify MainMenu.tsx**

Replace the import:

```tsx
// Drop:
// import { RunnerPanel } from '../voce/RunnerPanel';

// Add:
import { RunnerCreatorTabs } from '../creator/RunnerCreatorTabs';
```

Replace the `panel === 'runner'` block (currently `~line 437-447`):

```tsx
{panel === 'runner' && (
  <RunnerCreatorTabs
    crew={activeCrew}
    apiKey={apiKey}
    onApiKeyReady={onApiKeyReady}
    onSaved={onRunnerSaved}
  />
)}
```

This requires adding props to MainMenu. Update the `Props` type:

```tsx
type Props = {
  // ...existing props
  apiKey: string;
  onApiKeyReady: (key: string) => void;
  onRunnerSaved: () => void;
};
```

And accept them in the function signature.

- [ ] **Step 2: Update CrewLaunchExperience to pass new props**

In `apps/crew-running/components/launch/CrewLaunchExperience.tsx`, find the `<MainMenu>` render call and add the three new props (sourced from existing `apiKey`/`onApiKeyReady`/runner-customized callback the parent already manages).

- [ ] **Step 3: Update App.tsx**

In `apps/crew-running/App.tsx`, the `renderRunnerCreator` render-prop becomes obsolete. Pass `apiKey` / `setApiKeyState` / a `noop`-or-real `onRunnerCustomized` directly to `CrewLaunchExperience` via new top-level props. Drop the lazy `CustomizeScreen` import (will be deleted in Task 10).

- [ ] **Step 4: Typecheck**

```bash
cd apps/crew-running && npm run typecheck
```

Expected: zero errors.

- [ ] **Step 5: Tests**

```bash
cd apps/crew-running && npx vitest run
```

Expected: all pass. Voce tests still cover RunnerPanel in isolation (component remains exported).

- [ ] **Step 6: Smoke-test in browser**

```bash
cd apps/crew-running && npm run dev
```

Open `http://localhost:3100`, navigate to RUNNER tab in MainMenu, confirm 4 sub-tabs render, click each, confirm no console errors.

- [ ] **Step 7: Commit**

```bash
git add apps/crew-running/components/launch/MainMenu.tsx \
        apps/crew-running/components/launch/CrewLaunchExperience.tsx \
        apps/crew-running/App.tsx
git commit -m "feat(crew-running): RUNNER panel renders RunnerCreatorTabs"
```

---

## Task 9: Drop dead CSS tokens

**Files:**
- Modify: `apps/crew-running/index.css`

Per spec §4, remove obsolete `runner-creator__*` class rules.

- [ ] **Step 1: Identify dead rules**

Search `index.css` for these class selectors (regex: `\.runner-creator__(shell|layout|header|masthead|status-strip|body-reference|block|block-head|photo-block|crew-lock|crew-card|crew-swatches|preview-shell|back|dev)\b`). These tokens no longer appear in any JSX after Tasks 5-8.

- [ ] **Step 2: Delete those rule blocks**

For each match, delete the whole rule block (selector + braces + contents).

- [ ] **Step 3: Verify nothing depends on them**

```bash
cd apps/crew-running && grep -rn "runner-creator__shell\|runner-creator__layout\|runner-creator__masthead\|runner-creator__status-strip\|runner-creator__body-reference\|runner-creator__crew-lock\|runner-creator__back\|runner-creator__dev" components/ index.css
```

Expected: only matches in index.css comments (if any) or zero results.

- [ ] **Step 4: Build + smoke-test**

```bash
cd apps/crew-running && npm run build
```

Expected: build succeeds, no warnings about unused css.

```bash
npm run dev
```

Open http://localhost:3100, navigate to RUNNER tab, confirm tabs render without visual regressions.

- [ ] **Step 5: Commit**

```bash
git add apps/crew-running/index.css
git commit -m "chore(crew-running): drop dead runner-creator__ CSS tokens"
```

---

## Task 10: Delete CustomizeScreen.tsx

**Files:**
- Delete: `apps/crew-running/components/CustomizeScreen.tsx`

Once Task 8 lands and Task 9 confirms no consumers, the standalone screen has zero references.

- [ ] **Step 1: Confirm zero references**

```bash
cd apps/crew-running && grep -rn "CustomizeScreen" components/ App.tsx services/ data/ hooks/
```

Expected: zero results (or only comments).

- [ ] **Step 2: Delete the file**

```bash
rm apps/crew-running/components/CustomizeScreen.tsx
```

- [ ] **Step 3: Typecheck + tests + build**

```bash
cd apps/crew-running && npm run typecheck && npx vitest run && npm run build
```

Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add apps/crew-running/components/CustomizeScreen.tsx
git commit -m "chore(crew-running): remove dead CustomizeScreen.tsx"
```

---

## Task 11: Acceptance pass

Verify every checklist item from spec §10 against the implementation.

- [ ] **Step 1: Manual checklist walk**

For each item in `vault/CREATOR_DESIGN_SYSTEM.md` §10, verify in browser:

```bash
cd apps/crew-running && npm run dev
```

Then visit http://localhost:3100, navigate GUARDA ROUPA -> CREWS -> RUNNER -> CONFIG to confirm all menu tabs stay reachable while inside RUNNER. Inside RUNNER, switch FOTO / PERFIL / LOOK / FICHA and confirm:
- Crew chip shows once (right side of tab strip), nowhere else
- Height/peso inputs not duplicated
- No "CRIE SEU RUNNER" masthead, no RUNNER ID status strip, no CrewLockPanel block
- Numbered prefixes 01/02/.../05 absent
- All MainMenu nav items reachable
- Variant button lock regression test: equip 2 looks in sequence, both succeed
- Tab strip keyboard nav (left/right arrows wrap)
- `prefers-reduced-motion: reduce` respected
- Audio: nav-slab on tab switch, randomize-roll on MISTURAR, equip-snap on EQUIPAR, error-buzz on failed gen

- [ ] **Step 2: Final automated suite**

```bash
cd apps/crew-running && npm run typecheck && npx vitest run && npm run build
```

Expected: typecheck clean, all tests pass, build succeeds.

- [ ] **Step 3: Commit any small fixes uncovered**

If anything fails, fix inline; commit as `fix(crew-running): creator subtabs acceptance fallout`.
