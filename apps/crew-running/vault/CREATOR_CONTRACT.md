# Runner Creator Contract

Data: 2026-05-28
Escopo: `apps/crew-running` / Runner Creator

Este arquivo e a fonte de verdade para qualquer mudanca no creator.
Antes de editar `CustomizeScreen`, `crewService`, `wardrobe`, `runnerTypes` ou docs do creator, rode o contrato executavel:

```bash
cd "/Users/belissima/Desktop/running crew/apps/crew-running"
npm run check:creator-contract
```

## Regras Nao Negociaveis

- A criacao visual do runner e travada pela crew escolhida no onboarding.
- `CustomizeScreen` recebe `selectedCrewSlug` de `CrewLaunchExperience`.
- A geracao usa `CrewRenderContext` montado exclusivamente de `/crews/{selectedCrewSlug}/`.
- Nunca anexar assets de outras crews ao prompt de geracao.
- Nunca usar `public/styles/*` como input de geracao.
- `StylePicker`, `data/styles.ts` e selecao publica de estilo nao voltam para o creator.
- O estilo de render e fixo: `street-v2`.
- A influencia de estilo e contexto vem somente da crew selecionada.
- A identidade do runner vem de foto do rosto ou brief fisico escrito, campos de perfil e wardrobe.
- O modo com foto usa a foto apenas como referencia ampla de caracteristicas fisicas.
- O modo sem foto deve pedir uma descricao de rosto, cabelo, pele, postura e energia antes de gerar.
- A geracao nunca deve copiar rosto exato, cabelo exato, marcas faciais, roupa, identidade ou detalhes reconheciveis de uma pessoa real.
- A sheet 2x2 deve manter o mesmo personagem, cabeca, cabelo e corpo nas quatro celulas.
- Entre celulas, variar somente `top`, `bottom`, `shoes` e `accessory`.
- Slot `hair` nao existe no contrato do creator.
- Slots validos: `top`, `bottom`, `shoes`, `accessory`.
- O botao `TESTAR LOCAL` deve continuar disponivel no modal de estudio.

## Runner Types Permitidos

Ordem canonica:

```text
sprint
long-run
night-run
crew-pace
urban-trail
```

Labels canonicas:

```text
Sprint
Long Run
Night Run
Crew Pace
Urban Trail
```

Valores proibidos:

```text
crew-flow
Crew Flow
collective crew energy
group-pace
```

## Persistencia Esperada

`crew.saved_character` deve salvar:

- `crewSlug`
- `runnerTypeId`
- `renderStyleId: "street-v2"`
- `slots.top`
- `slots.bottom`
- `slots.shoes`
- `slots.accessory`

Nao salvar `slots.hair`.

## Validacao Padrao

```bash
cd "/Users/belissima/Desktop/running crew/apps/crew-running"
npm run check:creator-contract
npm run smoke:creator
npx tsc --noEmit
npm run build
git diff --check -- apps/crew-running
```

Smoke recomendado:

```text
selectedCrewSlug north-breakers -> creator -> upload -> nome -> TESTAR LOCAL -> sheet 2x2 -> Equipar look 1 -> crew.saved_character salvo
```
