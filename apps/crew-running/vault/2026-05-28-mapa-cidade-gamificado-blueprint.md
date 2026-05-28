# Blueprint — Mapa Cidade Gamificado Unificado — 2026-05-28

## Decisão

Unificar os três componentes de mapa fantasmas em um único componente `MapaCidade` que serve como **home interativo**, com depth via parallax + camadas (não 3D literal — respeita a decisão de [2026-05-27-street-backdrops-2d.md](2026-05-27-street-backdrops-2d.md)) e gamification real conectada.

O que o user chama de "mapa 3D gamificado" não é WebGL ou tilt isométrico — é a sensação de **riqueza espacial + interatividade + dados vivos**. O atual está fragmentado: Sp3DMapBackground decorativo, LaunchCityMap recém-restaurado mas isolado, MapStage operacional mas escondido atrás de `ABRIR MAPA`.

## Estado atual (código fantasma diagnosticado)

| Componente | LOC | Função hoje | Gamification ativa | Interativo |
|---|---|---|---|---|
| `Sp3DMapBackground` | 101 | Background SVG decorativo, 4 telas de launch | Não | Não (`aria-hidden`) |
| `LaunchCityMap` | 130 | Home panel após refactor 8f6c5a5 | Sim (ownership tier) | Sim (ping select) |
| `MapStage` | ~440 | Tela cheia atrás de `ABRIR MAPA` | Sim (ink, missions, XP, friends) | Sim (zoom L1/L2/L3, run tracker) |

Três visões da mesma cidade. Mesma data layer (`spLiveMap` zones + spots + signal route). Mesma estrutura SVG. Mas três geometrias, três tons, três níveis de richness — nenhum entrega a "cidade viva" prometida.

## Visão alvo — MapaCidade unificado

Um componente que substitui todos três no fluxo principal:

```
MainMenu home panel
└── <MapaCidade variant="menu" />        — viva, interativa, gamification leve
└── opcional ABRIR MAPA → fullscreen
    └── <MapaCidade variant="run" />     — gamification pesada, run tracker, friends
└── CitySignalEntry
    └── <MapaCidade variant="signal" />  — só ping select, sem gamification
└── ConsoleBoot / RunnerSavedTeaser
    └── <MapaCidade variant="ambient" /> — decorativa, aria-hidden, parallax sutil
```

Quatro `variant`s, **um componente**, **uma data layer**, **um vocabulário visual**.

## Camadas (do fundo pra frente)

1. **Asfalto** — backdrop jpg printed (reutiliza assets de `/backgrounds/`) com grain texture.
2. **Roads** — SVG polylines do `spLiveMap` (ruas reais projetadas). Ink wash baixo contraste.
3. **Zones** — `ZoneLayer` atual com `objectBoundingBox` fix (não tile). Status ownership colorido.
4. **Spots** — `SpotLayer` filtrado por zoom + ownership state.
5. **Routes** — signal route + crew arcs (do LaunchCityMap).
6. **Pings** — crew badges interativos no centro das zonas, com aria-pressed.
7. **HUD** — sobreposto (XP/level/streak chip — opt-in por variant).
8. **Friends** — `FriendPings` da F2-B (opt-in por variant).
9. **Scanner overlay** — animação de varredura (já tem em `.sp-3d-map-bg__scan`).

Parallax: camadas 1-3 movem 0.4x do pointer, camadas 4-6 movem 0.7x, camadas 7-9 fixas. Cria sensação de depth sem 3D real. `prefers-reduced-motion` desliga parallax.

## Padrões atuais aplicados

- **Hooks** isolados — `useRunnerProgress`, `useMapView` (zoom state), `useFriends`, `useReducedMotion`.
- **Sub-componentes** por camada em `components/map/layers/` — uma layer por arquivo.
- **Props discretos** — `variant`, `activeCrewSlug`, `onSelectCrew?`, `onOpenRun?`. Variant decide quais camadas/hooks ativar.
- **Tests** — render por variant + interactivity + a11y assertions em `components/map/__tests__/MapaCidade.test.tsx`.
- **A11y** — `role="application"` em variant interativo, `aria-label` por crew, focus management, `aria-pressed` em pings.
- **Storage** — `mapLayerStorage` já existe; estendê-lo para persist variant preferences se necessário.

## Build sequence (fásico)

### Fase A — Foundation (1 sessão)
1. **[data]** Auditar `spLiveMap.ts` para garantir todos dados necessários (roads polylines reais, asphalt asset key). Adicionar `SP_ROADS_POLYLINES` se faltar.
2. **[type]** Criar `MapaCidadeVariant = 'menu' | 'run' | 'signal' | 'ambient'` em novo `components/map/mapTypes.ts` (já existe — estender).
3. **[shell]** Criar `components/map/MapaCidade.tsx` — componente raiz com switch de variant, ainda sem camadas (só placeholder div).
4. **[test]** Smoke test: cada variant renderiza sem crash.

### Fase B — Camadas estáticas (1 sessão)
5. **[layer]** `AsphaltLayer.tsx` — backdrop jpg + grain. Reutiliza `/backgrounds/city-signal-map-2d.jpg`.
6. **[layer]** `RoadsLayer.tsx` — SVG polylines.
7. **[layer]** `ZonesLayer.tsx` — extrai e generaliza `ZoneLayer` atual (preserva `objectBoundingBox` fix).
8. **[layer]** `SpotsLayer.tsx` — extrai e generaliza `SpotLayer`.
9. **[test]** Visual regression snapshots por layer.

### Fase C — Interatividade (1 sessão)
10. **[layer]** `PingsLayer.tsx` — extrai os pings do LaunchCityMap como standalone. Mantém aria-pressed + status ring.
11. **[hook]** `useMapView.ts` — zoom city/zone/spot + active crew selection.
12. **[wire]** `MapaCidade variant="menu"` monta camadas 1-6 + PingsLayer interativo.
13. **[wire]** `HomePanel` substitui chamada do `LaunchCityMap` por `<MapaCidade variant="menu" />`.
14. **[test]** Click ping → onSelectCrew fired; keyboard nav entre pings.

### Fase D — Gamification pesada (1 sessão)
15. **[layer]** `HudLayer.tsx` — extrai HudOverlay atual.
16. **[layer]** `FriendsLayer.tsx` — extrai FriendPings.
17. **[layer]** `MissionsLayer.tsx` — extrai MissionLayer.
18. **[wire]** `MapaCidade variant="run"` monta TODAS camadas + RunController hook.
19. **[wire]** Substituir `MapStage` no `ABRIR MAPA` flow por `<MapaCidade variant="run" />`.

### Fase E — Parallax + polish (1 sessão)
20. **[hook]** `useParallax(layer, factor)` — translateX/Y based on pointer + RAF, desativa em reduced motion.
21. **[wire]** Aplicar parallax aos AsphaltLayer/RoadsLayer/ZonesLayer.
22. **[a11y]** Audit final — role=application, aria-label por crew, focus trap quando variant=run.
23. **[cleanup]** Remover `Sp3DMapBackground.tsx` + `StreetBackdrop.tsx` + `LaunchCityMap.tsx` + `MapStage.tsx` (substituídos). Atualizar imports em ConsoleBoot/CitySignalEntry/MainMenu/RunnerSavedTeaser.
24. **[vault]** Adicionar nota corrigindo `2026-05-27-street-backdrops-2d.md` linha 109 (era pra remover Sp3D — agora substituído por MapaCidade).

## Critérios de aceitação

- Apenas **um** componente importado em runtime para todas situações de mapa: `<MapaCidade variant="..." />`.
- Sp3DMapBackground.tsx, StreetBackdrop.tsx, LaunchCityMap.tsx, MapStage.tsx **deletados** do repo (não só órfãos — removidos).
- CSS `.sp-3d-map-bg__*`, `.street-backdrop__*`, `.launch-city-map__*`, `.map-stage*` **deletados** ou renomeados sob namespace `.mapa-cidade__*`.
- Variant `menu` no `HomePanel` mostra: ink ownership ring por crew, pings clickable, status tier, parallax sutil. Bundle não cresce > 5%.
- Variant `run` substitui `ABRIR MAPA` MapStage. Todo teste de `components/map/__tests__/` continua green ou migra pra `MapaCidade.test.tsx`.
- Reduced motion desliga parallax (verificar via `useReducedMotion()`).
- Suite total não cai abaixo do baseline atual (305/305).

## Riscos + mitigações

| Risco | Mitigação |
|---|---|
| MapStage tem ~440 LOC + 8 sub-layers + hooks complexos. Refactor cobre escopo grande. | Faseado A→E. Cada fase é mergeable isolated. Phase D só roda depois de C estável. |
| Substituir Sp3DMapBackground em 4 launch surfaces pode quebrar tom visual existente | Variant `ambient` preserva mesma estética. Diff visual em screenshots playwright antes/depois. |
| Parallax adiciona pointer listener — performance/jank em mobile | RAF-throttled, `will-change: transform` apenas nas camadas afetadas, kill switch via reduced motion. |
| MapStage tem run controller persistido — quebrar persistence é incidente real | Hook isolation na Fase D garante mesma assinatura. State key (`crewActiveRun`) preservado. Migration test obrigatório. |
| Auto-violação git: agentes paralelos absorvem WIP | `git stash` defensivo + worktree dedicado por fase. Mencionar em CLAUDE.md atualização. |

## Não fazer agora

- WebGL/Three.js real 3D — fora de escopo, performance custo alto, contradiz vault 2026-05-27.
- Tile-based map (Mapbox/Leaflet) — out of MVP scope, requires API key, custo $.
- Substituir spLiveMap data — mantém SP polygons sintéticos.

## Hooks pra F3 (reservar)

- Real-time crew positions via WebSocket (placeholder em `useFriends` já existe).
- Heatmap de inks acumulados — overlay extra em RoadsLayer.
- Voice radio chamando pings ("Norte está aberto") — extensão de `CrewRadioOverlay`.

## Próximo passo

Começar Fase A. Sessão dedicada com worktree isolado para evitar swept commits dos outros agentes. Vault doc atualizado a cada fase com diff de LOC e screenshots playwright.
