# QA Test Plan — Gamificação 2D — 2026-05-28

> Branch já mergeado em `main` (cdc2f9e). 211 unit tests cobrem matemática + storage + state machine. Este plano cobre o que falta: componente, interação, visual, mobile, e GPS de rua.

---

## Test Pyramid (estado atual)

| Camada | Coverage hoje | Lacuna |
|---|---|---|
| Unit (vitest) | 211 tests / 22 files — gamification math, geo, runTracker state, storage round-trip | ZERO testes em componentes map/* (MapStage, ZoneLayer, SpotLayer, etc) |
| Component (RTL) | 6 voce/* (parallel agent) | TODO: HudOverlay, LayerRail, RunHud, RunSummary, MapStage |
| E2E (Playwright) | Nada | TODO: smoke do flow inteiro |
| Manual desktop | Ad-hoc | TODO: roteiro padronizado |
| Manual mobile (real iPhone) | Nada | TODO: tabela viewport/safari/Chrome |
| Field GPS (rua) | Nada | TODO: protocolo + critérios pass/fail |

---

## 1. Automated — componente (RTL + vitest, jsdom)

Adicionar `components/map/__tests__/*.test.tsx`. Padrão já em uso por voce/__tests__/.

### 1.1 ZoneLayer

| # | Case | Espera |
|---|---|---|
| Z1 | Renderiza 5 paths (um por zone) | DOM contém 5 `<path>` com d= não-vazio |
| Z2 | Clique em zone dispara onSelectZone com id correto | spy chamada com `'centro'` ao clicar no path da centro |
| Z3 | Enter no path com role=button dispara onSelectZone | keyboard nav OK |
| Z4 | Space no path com role=button dispara onSelectZone | keyboard nav OK |
| Z5 | activeZoneId aplica classe `is-active`, outras `is-dimmed` | classNames corretos |
| Z6 | ownership ≥ 0.6 → classe `is-status-owned` | territoryStatus mapeado |

### 1.2 SpotLayer

| # | Case | Espera |
|---|---|---|
| S1 | zoom='city' não renderiza nada | layer vazio |
| S2 | zoom='zone' renderiza apenas spots do activeZoneId | conta = getSpotsByZone(id).length |
| S3 | zoom='spot' renderiza todos 11 + labels | text com nome de cada spot |
| S4 | Spot inativo (locked) tem classe `is-locked` e não dispara onSelectSpot | spy não chamada |
| S5 | Spot ativo clicado dispara onSelectSpot com id | spy chamada |

### 1.3 MissionLayer

| # | Case | Espera |
|---|---|---|
| M1 | zoom='city' não renderiza | nada visível |
| M2 | Mission sem coord (mock zoneId vazio, no spotIds) → console.warn em DEV | spy console.warn chamada |
| M3 | 3 missions renderizam 3 sticker bases | conta correta |

### 1.4 LayerRail

| # | Case | Espera |
|---|---|---|
| L1 | 4 chips renderizam | botões = 4 |
| L2 | Chip ativa tem aria-pressed=true | atribuição correta |
| L3 | Chip indisponível (availability=false) tem disabled + aria-disabled | onClick não chama onToggle |
| L4 | aria-controls aponta ao SVG id passado | attribute = controlsId |
| L5 | Clique em chip não-disabled chama onToggle com key | spy chamada |

### 1.5 HudOverlay

| # | Case | Espera |
|---|---|---|
| H1 | xp=0 mostra LV 1, bar=0% | text |
| H2 | xp=500 mostra LV correto via xpToLevel | text bate |
| H3 | streakWeeks=7 mostra "7" no badge | text |
| H4 | crew accent aplicado ao level number | inline style color |
| H5 | crewSlug=undefined cai no fallback CREWS[0] sem crash | render OK |

### 1.6 RunHud

| # | Case | Espera |
|---|---|---|
| RH1 | state=tracking mostra "AO VIVO" + botão PAUSAR | text + button |
| RH2 | state=paused mostra "PAUSADA" + botão RETOMAR | text + button |
| RH3 | totalMeters=2500 mostra "2.50" no KM stat | format ok |
| RH4 | pace formata mm:ss quando distance > 10m | regex |
| RH5 | Clique PAUSAR chama onPause | spy |
| RH6 | Clique ENCERRAR chama onStop | spy |
| RH7 | touchedSpotIds.length renderizado vs totalSpots | "3/11" |

### 1.7 RunSummary

| # | Case | Espera |
|---|---|---|
| RS1 | Renderiza dialog com role=dialog + aria-modal | a11y |
| RS2 | breakdown.total > 0 mostra "+X XP" | text |
| RS3 | streakBumped=true mostra "Streak +1!" notice | text |
| RS4 | streakBroken=true mostra "Streak quebrado" notice | text |
| RS5 | freezeUsed=true mostra mensagem freeze | text |
| RS6 | Clique SALVAR chama onSave | spy |
| RS7 | Clique DESCARTAR chama onDiscard | spy |
| RS8 | loopMult=1 oculta linha "Loop ×" | dom não contém |

### 1.8 TrailLayer

| # | Case | Espera |
|---|---|---|
| T1 | 0 pontos → null render | nada |
| T2 | 1 ponto → null (segments < 2 pontos filtrados) | nada |
| T3 | 3 pontos sem pause → 1 path | conta=1 |
| T4 | 5 pontos com 1 isResumeAnchor no meio → 2 paths | conta=2 |
| T5 | 2 pauses back-to-back same ms → keys únicas (sem React warning) | nenhuma key duplicada |
| T6 | color prop aplica stroke | attribute |

### 1.9 MapStage integration

| # | Case | Espera |
|---|---|---|
| MS1 | Mount → renderiza HUD + canvas SVG + LayerRail + actions | DOM completa |
| MS2 | Sem activeRun storage → não abre modal Retomar | resumePromptOpen=false |
| MS3 | Com paused activeRun storage → abre modal Retomar | dialog visível |
| MS4 | Permission denied → toast aparece com botão "TENTAR DE NOVO" | role=alert |
| MS5 | tracker.state=tracking → LayerRail + actions escondem, RunHud aparece | conditional render |
| MS6 | Stop em corrida → RunSummary com breakdown correto | modal render |
| MS7 | Save no summary → onRunCompleted chamado com next progress | spy |
| MS8 | Discard no summary → tracker reset, modal some | dom check |

### 1.10 useRunController hook

| # | Case | Espera |
|---|---|---|
| C1 | Mount sem activeRun → resumePromptOpen=false | initial |
| C2 | Mount com paused activeRun → resumePromptOpen=true | initial |
| C3 | startRun chama runTracker.start com selectedCrewSlug | spy |
| C4 | stopRun popula pendingSummary com breakdown + streak | state shape |
| C5 | saveSummary dispara onRunCompleted com nextProgress | spy + arg |
| C6 | retryPermission reseta tracker + tenta novo start | spy ordering |

---

## 2. E2E — Playwright (1 spec smoke)

Path: `apps/crew-running/tests/e2e/map-flow.spec.ts`. Roda contra dev server (`./node_modules/.bin/vite` background).

### 2.1 Map smoke

1. Boot → ConsoleBoot → Title → CitySignal → MainMenu seed via localStorage flags
2. Clica "ABRIR MAPA" no MainMenu
3. Assert: HUD streak/XP/profile presentes
4. Assert: SVG `<path>` count ≥ 5 (zones)
5. Clica chip "Missões" → assert is-on
6. Clica zone Centro (path) → assert zoom L2 + banner "Centro · Downtown Rush"
7. Clica spot Vale → assert zoom L3 + label "Vale do Anhangabau"
8. Volta L1 → L2 → L1 via botão ←
9. Clica QG → volta MainMenu

### 2.2 Permission denied flow

Mock geolocation com permission denied. Clica INICIAR CORRIDA → assert toast visível + botão TENTAR DE NOVO.

### 2.3 Run lifecycle (mocked)

Mock geolocation com sequência de pontos. Start → assert RunHud aparece. Pause → assert "PAUSADA". Stop → assert RunSummary com XP > 0.

---

## 3. Manual QA Desktop (Chrome + Firefox + Safari)

Roteiro padronizado. Tester executa + tira screenshot per case. Salva em `apps/crew-running/qa-runs/YYYY-MM-DD-{tester}/`.

### 3.1 Pre-flight

- [ ] `localStorage.clear()` + reload
- [ ] DevTools open

### 3.2 Bootstrap → Map

| Step | Espera |
|---|---|
| 1. Abre `/` | ConsoleBoot renderiza, sem erro console |
| 2. Skip intro | TitleScreen renderiza |
| 3. Entra → CitySignal | 5 crew pings animam |
| 4. Escolhe crew | accent muda |
| 5. Main menu carrega | passport zone presente |
| 6. Completa criador runner | RunnerSavedTeaser aparece |
| 7. Clica ABRIR MAPA | MapStage L1 carrega |

### 3.3 Map L1 / Zoom

| Step | Espera |
|---|---|
| 8. 5 zones com fill territory_pattern | SVG `<pattern>` aplicado |
| 9. Live pulses animam | halo circle pulsa 2.4s |
| 10. User pin na zone do crew | badge centralizado |
| 11. Tap zone → L2 transition | viewBox interpola |
| 12. L2 mostra 2-3 spots | dots visíveis |
| 13. Tap spot → L3 | signal route ribbon anima |
| 14. Botão ← volta L2 → L1 | history navega |
| 15. Pinch zoom no trackpad | ✗ (desktop OK skip) |

### 3.4 Layer toggles

| Step | Espera |
|---|---|
| 16. Toggle Território → polygons somem | territoria desliga |
| 17. Toggle Live → pulses param | live desliga |
| 18. Toggle Missões | sticker mission flags aparecem |
| 19. Reload page → toggles persistem | localStorage prefs |
| 20. History chip → disabled (não implementado) | aria-disabled=true |

### 3.5 Run lifecycle (geolocation mock via DevTools Sensors)

| Step | Espera |
|---|---|
| 21. INICIAR CORRIDA — DevTools Sensors set location SP centro | RunHud aparece, AO VIVO |
| 22. Update location +200m via Sensors | trail draws + distance sobe |
| 23. PAUSAR | tempo congela, status PAUSADA |
| 24. Update location (deve ignorar) | distance NÃO muda |
| 25. RETOMAR | tempo resume + trail resume com gap (no line cross) |
| 26. ENCERRAR | RunSummary modal, XP > 0 |
| 27. SALVAR | back to map, HUD reflete XP |
| 28. Reload mid-run (start novo run + reload) | modal "Corrida em andamento" + Retomar |

### 3.6 Permission denied

| Step | Espera |
|---|---|
| 29. Revoke geo permission no browser settings | (manual) |
| 30. INICIAR CORRIDA | toast "Sem permissão de GPS" |
| 31. Grant permission no browser | (manual) |
| 32. TENTAR DE NOVO | run inicia OK |

### 3.7 Reduced motion

| Step | Espera |
|---|---|
| 33. OS prefers-reduced-motion enabled | live pulse não anima, trail não anima, transitions cortadas |

---

## 4. Manual QA Mobile (iPhone SE 375 + iPhone 14 390 + Android 412)

DevTools responsivo OU device real. Mesmo roteiro 3.2-3.6 + extras:

| Step | Espera |
|---|---|
| M1 | Touch targets ≥ 44pt em todos botões | tap não erra |
| M2 | LayerRail thumb-reach na bottom | botões sob polegar |
| M3 | RunHud bottom não cortado pelo notch | safe-area-inset funciona |
| M4 | RunSummary modal scrolla em 320×568 (iPhone SE 1st gen) | overflow-y |
| M5 | Pinch-zoom L1↔L2↔L3 funciona | gesture handler |
| M6 | Long-press zone → crew card peek (futuro v2) | skip se não impl |

---

## 5. Field GPS test (rua real)

**Requisito:** iPhone real + crew-running rodando via dev LAN. Comando: `./node_modules/.bin/vite --host` em laptop, abre `http://<IP-local>:3100/` no Safari iOS. Permite localização quando pedir.

**Rota de teste:** 1-2km loop curto + 1 spot conhecido (ex: Vale do Anhangabau).

### 5.1 Pre-flight rua

- [ ] Bateria > 60%
- [ ] WiFi LAN estável OU dev tunneled via ngrok
- [ ] DevTools remote desabilitado (Safari iOS não permite anyway)
- [ ] Console acessível via Safari Mac → Develop → iPhone
- [ ] localStorage limpo

### 5.2 Casos rua

| # | Case | Aceitação |
|---|---|---|
| F1 | Start na frente de casa | trail começa, primeiro ponto desenha |
| F2 | Corre 100m em linha reta | distance ≈ 100m ± 20m, trail acompanha |
| F3 | Passa < 50m de spot conhecido | spot tocado, contador sobe |
| F4 | Pausa para semáforo 60s | tempo congela, position skip não conta km |
| F5 | Retoma corrida | trail nova segment, sem linha cruzando gap |
| F6 | Corre dentro da zone do crew | metersInTerritory sobe |
| F7 | Corre saindo da zone | metersInTerritory para de subir |
| F8 | Fecha loop voltando ±80m do start | closedLoop=true no summary |
| F9 | Encerra → summary correto | XP cálculo plausível, breakdown linhas batem |
| F10 | Tela vai escura mid-run | Wake lock prevê — após 30s ainda acesa (iOS Safari 16.4+) |
| F11 | App tela hidden (multitask) → volta | wake lock re-acquire, posições continuam |
| F12 | Force-quit Safari mid-run + reabre URL | modal "Corrida em andamento" + Retomar restaura distance |
| F13 | Streak +1 após 3ª corrida da semana | summary notice "Streak +1!" |

### 5.3 Sinais de falha

- Distance accumulando parado (drift) → accuracy filter falhou
- Trail desconectado mesmo sem pause → min-step filter excessivo
- Spot não tocado passando perto → proximity threshold pequeno demais
- closedLoop false em loop óbvio → threshold 80m insuficiente OU primeiro ponto ruim
- App congela 5+ segundos → main thread bloqueada por math

---

## 6. Edge cases (smoke matrix)

| # | Cenário | Espera |
|---|---|---|
| E1 | Streak break em ano boundary (W52→W01 mock) | freeze ou reset coerente |
| E2 | Ink decay após 90 dias | inkPerZone próximo 0 |
| E3 | xp = MAX_SAFE_INTEGER - 1000 + corrida | level cap funciona, não overflow |
| E4 | inkPerZone com NaN no storage (corrupt) | fallback DEFAULT |
| E5 | RunnerProgress shape inválido (e.g. xp="string") | DEFAULT retornado |
| E6 | MapLayerPrefs com extra fields | whitelist drops |
| E7 | GPS retorna accuracy=Infinity | ponto ignorado |
| E8 | watchPosition timeout | tracker mantém estado, sem crash |
| E9 | Dois clicks rápidos em INICIAR CORRIDA | segundo recusa (start retorna false) |
| E10 | Pause sem state=tracking | no-op, sem crash |

---

## 7. Visual / Identity (anti-AI-slop)

Conferência visual contra DESIGN.md + GAME_UI_TEMPLATE.md:

- [ ] Sem glow neon em pings
- [ ] Sem radial-gradient bloom
- [ ] Sem partícula sparkle genérica
- [ ] Sem tilt-shift / DOF / motion blur
- [ ] NPC/ping movimento stepped (não smooth 60fps)
- [ ] Sem texto curvo seguindo path
- [ ] Sem mini-mapa redondo
- [ ] Zonas conquistadas têm territory_pattern.png (não chapado puro)
- [ ] Fontes: Bowlby/Anton/JetBrains/Permanent Marker/Inter/Bungee nos slots certos
- [ ] Marker-border irregular em XP bar + mission cards

---

## 8. Acessibilidade

- [ ] Tab navega chips + zones (role=button) + spots ativos
- [ ] Enter/Space ativa role=button
- [ ] aria-label em SVG, MapStage section, LayerRail toolbar
- [ ] aria-pressed em chips toggleable
- [ ] aria-controls em chips aponta para SVG id
- [ ] aria-disabled em botões sem callback
- [ ] role=dialog + aria-modal em RunSummary + ResumePrompt
- [ ] sr-only h2 em MapStage
- [ ] Reduced-motion respeita
- [ ] Contraste WCAG AA texto sobre asfalto base (#D9CFB8 sobre #2A2826)

---

## 9. Performance (Lighthouse mobile)

Comando: `./node_modules/.bin/vite preview` + Chrome Lighthouse mobile.

Target: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 90, SEO ≥ 80.

Específico:
- [ ] Initial bundle gzip ≤ 150KB
- [ ] FCP < 1.8s em throttling 4G
- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] TBT < 200ms

---

## 10. Sign-off checklist

- [ ] Todos automated (1.x) implementados e passando
- [ ] E2E smoke (2.1) passa
- [ ] Manual desktop (3.x) sem regressão
- [ ] Manual mobile (4.x) sem regressão
- [ ] Field GPS (5.x) F1-F9 obrigatórios; F10-F13 stretch
- [ ] Edge cases (6.x) sem crash
- [ ] Visual identity (7) pass
- [ ] A11y (8) pass
- [ ] Lighthouse (9) targets batidos
- [ ] CLAUDE.md gate: zero teste pulado em produção

---

## Execução

**Fase 1 (now):** implementar `components/map/__tests__/*` cobrindo 1.1-1.10. ~40 novos testes esperados. Total alvo: ~250 unit + component.

**Fase 2:** Playwright spec 2.1-2.3 + harness do dev server.

**Fase 3:** Manual desktop QA — registrar resultado em `qa-runs/2026-05-28-desktop.md`.

**Fase 4:** Field GPS rua — usuário corre 1-2km, registra resultado em `qa-runs/2026-05-28-field.md` com screenshots.

**Fase 5:** Lighthouse + sign-off.

Cada fase pode rodar isolada. Fase 1+2 são automated CI — entrarão no `npm run validate`.
