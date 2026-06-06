# GPS Tracker + Code Review Polish — 2026-05-28

> Branch: `feat/map-gamification`. Após dois passes de fix (752e184, 8e691ba) os reviewers ainda apontaram 11 itens. Além disso, usuário decidiu pivotar o stub "demo run" para tracker GPS real (vai testar correndo na rua), com **todas** as features: Start/Stop, Wake lock, trail ao vivo, spot proximity, territory detection, closed-loop, Pause/Resume.

---

## Contexto

O botão `INICIAR CORRIDA` hoje dispara `handleStartDemoRun` que adiciona 1km estático ao perfil. Usuário rejeitou simulação — quer GPS real porque vai testar com o celular na rua. Isso transforma a fase de "polish" em uma feature substancial. Por escolha do usuário, GPS + polish viajam no mesmo branch + PR.

Polish já fechado em 8e691ba (não re-fazer):
- 33 unit tests (gamification + spLiveMap)
- Acentos PT-BR
- Layer state persistido em localStorage
- `INK_PER_FULL_OWNERSHIP` constante
- Non-null assertion removida
- Race condition no demo run
- aria-label + sr-only h2
- reduced-motion estendido

---

## Escopo

### A) GPS Tracker (feature nova)

State machine, geolocation, distance, territory, spots, closed-loop, trail visual, wake lock, pause/resume, persistência de corrida ativa, summary pós-corrida, atualização real de streak.

### B) Polish remanescente (review fallout)

1. `computeRunXp` — refator pra eliminar `(XP_TERRITORY_MULT - 1)` mágico
2. `computeRunXp` — validar inputs (clamp negativo, `kmInTerritory ≤ distanceKm`)
3. Storage schema — validar shape de `RunnerProgress` / `MapLayerPrefs` no parse
4. `MissionLayer` — `console.warn` em vez de silent null
5. `LaunchCityMap` — comentar dep `[]` do useMemo
6. Empty state — disable chip Missions/History quando vazio (com `aria-disabled`)
7. Safe-area-inset — top HUD e bottom action bar
8. `LayerRail` — `aria-controls` apontando para o SVG da MapStage
9. `getCrewBySlug` — documentar contrato (fallback CREWS[0])
10. `SP_SPOT_MAP_FEATURES` — invariant test (todos spots dentro de SP_MAP_BOUNDS)
11. `INK_PER_KM` constante derivada para conversão XP→ink (em vez de reusar `earned` como ink)

---

## Arquitetura GPS

### Estados

```
idle → tracking ⇄ paused → ended → idle
                       ↘ aborted → idle
```

- `idle`: nenhuma corrida ativa.
- `tracking`: watchPosition feeding, wake lock ativo, trail growing.
- `paused`: watchPosition desligado, contador de tempo congelado, wake lock liberado.
- `ended`: corrida finalizada, summary mostrado, awaiting confirmação.
- `aborted`: usuário descartou (não persiste).

### Files novos

| Path | Responsabilidade |
|---|---|
| `services/runTracker.ts` | Singleton wrapper de `navigator.geolocation.watchPosition` + `WakeLock`. Emite eventos. Pure logic, sem React. |
| `services/runStorage.ts` | Persistência de `ActiveRun` (resume-on-reload) e `RunHistory`. |
| `data/geo.ts` | Haversine, point-in-polygon, distância-mínima, smoothing. |
| `data/geo.test.ts` | Tests dos helpers geométricos. |
| `hooks/useRunTracker.ts` | Hook React que consome runTracker singleton + sincroniza com state. |
| `components/map/TrailLayer.tsx` | Renderiza polyline da corrida ativa sobre o mapa. |
| `components/map/RunHud.tsx` | Overlay durante corrida: dist/tempo/pace/km em territ/spots/Pause/Stop. |
| `components/map/RunSummary.tsx` | Modal pós-corrida: XP, spots tocados, badges desbloqueadas, "salvar" / "descartar". |

### Files modificados

| Path | Mudança |
|---|---|
| `data/gamification.ts` | Refator `computeRunXp` (split base × territory cleanly). Adicionar `INK_PER_KM`, `bumpStreak()`. Validation inputs. |
| `data/gamification.test.ts` | Testes pro refator + bumpStreak + clamp. |
| `data/spLiveMap.test.ts` | Invariant: spots ⊂ SP_MAP_BOUNDS. |
| `data/spLiveMap.ts` | Export `getSpotsWithinRadius(point, m): SpotMapFeature[]`. |
| `services/launchStorage.ts` | Validators schema `RunnerProgress` / `MapLayerPrefs`. Helper `bumpWeeklyStreak`. |
| `services/launchStorage.test.ts` | **Novo**. Round-trip tests + corrupt data fallback. |
| `components/map/MapStage.tsx` | Integra `useRunTracker`. Renderiza `TrailLayer` + `RunHud` em tracking. Safe-area-inset. |
| `components/map/LayerRail.tsx` | `aria-controls` + disabled state. |
| `components/map/MissionLayer.tsx` | console.warn em null. |
| `components/map/HudOverlay.tsx` | Doc comment sobre fallback. |
| `components/launch/CrewLaunchExperience.tsx` | Remove stub `handleStartDemoRun`. Substitui por `onStartRun={() => tracker.start()}`. |
| `components/launch/LaunchCityMap.tsx` | Comment useMemo intent. |
| `index.css` | RunHud + RunSummary + Trail styles + safe-area-inset env(). Disabled chip. |

### Geolocation API

```ts
const watchId = navigator.geolocation.watchPosition(
  onPosition,
  onError,
  { enableHighAccuracy: true, maximumAge: 3000, timeout: 12000 }
);
```

Filtros:
- Aceita posição se `accuracy ≤ 30m` (drop outliers).
- Aceita se distância do último ponto ≥ 5m (drop noise stationary).
- Se accuracy > 30m, ignora ponto mas mantém último.

### Haversine

```ts
const R = 6371000; // meters
const dLat = toRad(b.lat - a.lat);
const dLng = toRad(b.lng - a.lng);
const sa = Math.sin(dLat / 2);
const sn = Math.sin(dLng / 2);
const h = sa * sa + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sn * sn;
return 2 * R * Math.asin(Math.sqrt(h));
```

### Point-in-polygon (ray casting)

Padrão ray casting horizontal contagem ímpar = dentro. Polígonos do `spLiveMap` são fechados (último ponto = primeiro).

Performance: 5 zones × ~5 vertices, executado a 1Hz. Trivial.

### Spot proximity

Para cada nova posição válida: calcular Haversine para cada um dos 11 spots. Se `< 50m` e spot ainda não tocado nesta corrida → marca em `touchedSpotIds: Set<string>`. Spec diz +15 XP por spot, one-shot/dia (não por corrida) — manteremos por corrida no v1 do tracker (per-day tracking adiciona complexity desnecessária pra MVP de rua).

### Closed-loop

Ao acionar `stop()`:
```ts
const startPoint = points[0];
const endPoint = points[points.length - 1];
const closedLoop = haversine(startPoint, endPoint) < 80;
```

### Wake Lock

```ts
let sentinel: WakeLockSentinel | null = null;
const acquire = async () => {
  if (!('wakeLock' in navigator)) return;
  sentinel = await navigator.wakeLock.request('screen');
};
const release = () => sentinel?.release();
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && state === 'tracking' && !sentinel) acquire();
});
```

Browsers sem suporte (Firefox iOS) — feature degrada silenciosamente.

### Pause/Resume

- `pause()` chama `geolocation.clearWatch(watchId)` + `release()` wake lock. Congela `elapsedMs` accumulator.
- `resume()` re-acquire wake lock + re-`watchPosition`. Adiciona segmento descontínuo no `points` (marcado com flag `isResumeAnchor`). Distância NÃO conta gap.

### Trail visual

`TrailLayer.tsx` consome `points: LngLat[]` do tracker. Renderiza `<polyline>` SVG projetada via `polylineToPath`. Stroke = `var(--crew-accent)`, stroke-width responde ao zoom level. Segmentos pause-gap pulam (multiple polylines separadas por `isResumeAnchor`).

### RunHud

Overlay full-bleed durante tracking. Mostra:
- Tempo (mm:ss, JetBrains Mono)
- Distância (km, Bowlby One)
- Pace atual (min/km)
- Spots tocados (X/11)
- km em territ
- Botões: PAUSAR (chalk variant), ENCERRAR (solid red)

### RunSummary

Modal pós-stop. Mostra:
- Distância total
- Tempo total (excluindo pause)
- XP ganho (com breakdown: base + territ + spots + loop)
- Spots tocados
- Badges desbloqueadas nesta corrida
- Botão SALVAR (persist + close) / DESCARTAR (abort)

### Persistência de corrida ativa

Chave `crewActiveRun`. Shape:
```ts
interface ActiveRun {
  startedAt: number;
  elapsedMs: number; // ao salvar pause/end
  state: 'tracking' | 'paused';
  points: Array<LngLat & { t: number; isResumeAnchor?: boolean }>;
  touchedSpotIds: string[];
  kmInTerritoryAccum: number;
  totalKm: number;
}
```

Restaurada na próxima abertura do MapStage. Permite resume após crash/reload.

### Streak — semântica real

`RunnerProgress.streakWeeks` + novos:
- `weekKey: string` — ISO week (e.g. `"2026-W22"`)
- `runsThisWeek: number`

Em cada `endRun`:
- Compute ISO week atual.
- Se `weekKey === current` → `runsThisWeek++`.
- Senão → se `runsThisWeek >= 3` no anterior `weekWindowAt + 7d` → `streakWeeks++`. Senão se gap > 1 semana → check freeze: `freezesAvailable >= 1` → `freezesAvailable--`. Senão `streakWeeks = 0`.
- Resetar `weekKey = current`, `runsThisWeek = 1`.

Helper isolado `bumpStreak(progress, now): RunnerProgress` testável.

---

## Polish detalhado

### computeRunXp refactor

Antes:
```ts
const base = distanceKm * XP_BASE_PER_KM;
const territoryBonus = kmInTerritory * XP_BASE_PER_KM * (XP_TERRITORY_MULT - 1);
```

Depois:
```ts
const baseKm = Math.max(0, distanceKm - clampedTerritoryKm);
const baseXp = baseKm * XP_BASE_PER_KM;
const territoryXp = clampedTerritoryKm * XP_BASE_PER_KM * XP_TERRITORY_MULT;
```

Onde `clampedTerritoryKm = Math.min(Math.max(0, kmInTerritory), Math.max(0, distanceKm))`.

Matemática equivalente ao caso normal, mas explícita: km dentro vale 20, km fora vale 10. Sem `-1` mágico.

### Storage validators

```ts
const isRunnerProgress = (v: unknown): v is RunnerProgress => {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.xp === 'number' &&
    typeof o.level === 'number' &&
    typeof o.streakWeeks === 'number' &&
    typeof o.lastRunAt === 'number' &&
    typeof o.inkPerZone === 'object' &&
    Array.isArray(o.badgeUnlocks)
  );
};
```

Mesma técnica para MapLayerPrefs. Se shape inválido → defaults.

### Empty state — chip disabled

LayerRail recebe prop `available: Partial<Record<keyof MapLayerState, boolean>>`. Chip cuja layer não tem dados (e.g. `history.length === 0`) recebe `disabled` + `aria-disabled`. CSS já tem `[disabled]` style.

### Safe-area-inset

```css
.map-hud-overlay { padding-top: max(10px, env(safe-area-inset-top)); }
.map-layer-rail { padding-bottom: max(8px, env(safe-area-inset-bottom)); }
.map-stage-actions { padding-bottom: max(14px, env(safe-area-inset-bottom)); }
```

### LayerRail aria-controls

`MapStage` passa `aria-controls="map-stage-svg-{id}"` (via useId) pra LayerRail. SVG ganha id correspondente.

---

## Tests (additions)

| Test file | Cobre |
|---|---|
| `data/geo.test.ts` | Haversine entre coords conhecidas SP (Vale ↔ República ≈ 360m). Point-in-polygon dentro/fora. getSpotsWithinRadius. |
| `data/gamification.test.ts` | computeRunXp clamp negativos + kmInTerritory > distanceKm + refactor invariant (baseline cases continuam batendo). bumpStreak: 1ª run, 2ª run mesma semana, 3ª run = streak++, gap 1 semana freeze, gap 2 semanas zera. |
| `data/spLiveMap.test.ts` | Invariant: todos `SP_SPOT_MAP_FEATURES` dentro de SP_MAP_BOUNDS. |
| `services/launchStorage.test.ts` | Roundtrip RunnerProgress. Corrupt JSON → defaults. Schema mismatch → defaults. |
| `services/runTracker.test.ts` | State machine transitions. Pause não conta gap. Closed-loop detection at threshold. |

Target: ~25 novos testes, total ~58.

---

## Verification

1. **Bench geográfico (offline):** `npm run test` — todos passam.
2. **Browser desktop:** dev server, simular geolocation no DevTools (Sensors → Location custom). Start → mover marker → ver trail desenhar.
3. **iPhone real (rua):** abre dev server via LAN (`VITE_DEV_HOST=lan`). Permite geo. Clica INICIAR. Roda 200m. Confirma:
   - Trail aparece.
   - Distância sobe.
   - Pause congela.
   - Spot tocado dispara confetti hand-drawn.
   - Stop → summary com XP.
   - Salvar → reload preserva XP atualizado.
4. **Crash recovery:** durante run, refresh página. Reabrir mapHome → modal "Continuar corrida?" → restaura state.
5. **Permissão negada:** revogar geo no browser → start → modal explicativo + back to map.
6. **Wake lock:** trava tela em iPhone — não bloqueia, mas verifica que ao voltar refresh continua. Em Chrome desktop simula `document.hidden = true` e checa re-acquire.

---

## Out of scope (deste plano)

- Backend sync de corridas (apenas localStorage v1).
- Histórico/replay de corridas anteriores.
- Sharing social do summary.
- Auto-pause inteligente (semáforo detection sem botão).
- GPS smoothing avançado (Kalman) — usar filtro simples por accuracy threshold.
- Audio cues durante corrida (futuro nice-to-have).
- Wear OS / Apple Watch integration.
- Vibração háptica nos spot-touch (browser support irregular).

---

## Risk

- **iOS Safari**: WakeLock API só disponível 16.4+. Fallback silencioso ok.
- **Permissão geo**: usuário pode negar. Modal claro.
- **Battery drain**: high-accuracy + 1Hz polling é parruda. Aceitável pra MVP street test; otimização futura.
- **Drift sem GPS**: dentro de túnel/edifício o erro acumula. accuracy threshold mitiga.
- **State corruption**: validators + try/catch em todo storage path.
