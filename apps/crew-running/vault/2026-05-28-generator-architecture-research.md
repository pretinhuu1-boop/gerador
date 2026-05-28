# Runner Generator Architecture Research

Data: 2026-05-28
Escopo: `apps/crew-running` / Runner Creator vNext

## Conclusao curta

O caminho correto nao e reabrir o antigo `StylePicker` nem voltar com
`slots.hair` como wardrobe. O contrato atual proibe isso explicitamente.

A evolucao certa e separar:

- `identity`: tracos fixos do runner, incluindo cabelo escolhido, biotipo,
  pele/energia/postura e brief fisico.
- `wardrobe`: itens mutaveis entre looks: `top`, `bottom`, `shoes`,
  `accessory`.
- `sheetSession`: uma geracao grande por sessao, com varios looks recortaveis
  localmente.
- `inventoryAssets`: icones e previews pre-gerados, usados apenas na UI, sem
  virar input de estilo para a geracao.

Assim recuperamos cabelo e biotipos sem quebrar a regra central: o runner
mantem a mesma identidade, corpo e cabelo dentro da sheet, e so roupa/acessorio
variam entre celulas.

## Estado atual observado

- `services/crewService.ts` monta uma sheet 2x2 em uma chamada Gemini
  `gemini-2.5-flash-image`.
- `buildVariants()` varia somente `top`, `bottom`, `shoes`, `accessory`.
- O prompt ja pede um cabelo fixo, mas esse cabelo e inferido pelo modelo, nao
  selecionavel.
- O fallback local ja tem conceito interno de `hairShape`, mas derivado de
  `sex`, nao de uma escolha do jogador.
- `RunnerProfile` so tem `name`, `sex`, `heightCm`, `weightKg`,
  `personality`.
- `SavedCharacter` salva um unico crop equipado em `localStorage`; isso nao
  escala bem para packs maiores de imagens.
- O contrato atual bloqueia `StylePicker`, `data/styles.ts`, `public/styles/*`
  e `slots.hair`.

## Repositorios pesquisados

### 1. ComfyUI

Link: https://github.com/Comfy-Org/ComfyUI

Uso potencial: pipeline local/servidor para gerar sheets grandes, com workflows
versionados em JSON, fila, cache e nos de controle. O repo se descreve como
GUI/backend/API com interface de grafo e suporta ControlNet, LoRAs, upscale e
workflows JSON.

Fit para o projeto: bom como laboratorio e possivel backend futuro. Ruim para
runtime web simples se depender de setup local pesado.

### 2. ComfyUI_IPAdapter_plus

Link: https://github.com/cubiq/ComfyUI_IPAdapter_plus

Uso potencial: condicionar uma geracao por imagem de referencia. O README
define IPAdapter como algo proximo de uma "1-image LoRA" para transferir
subject ou estilo de uma referencia.

Fit para o projeto: bom para consistencia de personagem em pipeline interno.
Risco: GPL-3.0 e manutencao limitada; revisar licenca antes de embedar ou
distribuir.

### 3. ControlNet

Link: https://github.com/lllyasviel/ControlNet

Uso potencial: travar pose/layout/turnaround sem deixar o modelo inventar
composicao. O repo oficial descreve ControlNet como uma estrutura para
adicionar condicoes de controle a diffusion models.

Fit para o projeto: bom para sheets com grade, pose neutra, frente/lado/costas
ou varios crops previsiveis.

### 4. InstantID / PhotoMaker / InstantCharacter

Links:

- https://github.com/instantX-research/InstantID
- https://github.com/TencentARC/PhotoMaker
- https://github.com/Tencent-Hunyuan/InstantCharacter

Uso potencial: consistencia de identidade a partir de imagem de referencia.

Fit para o projeto: referencia tecnica, nao contrato de produto. Nosso contrato
exige nao copiar rosto/cabelo/identidade real exata; portanto esses metodos
devem ser usados, no maximo, para inspirar "ancora ficcional" e nao para
preservar identidade real. Tambem ha riscos de licenca/modelos/checkpoints.

### 5. CharForge

Link: https://github.com/RishiDesai/CharForge

Uso potencial: pipeline completo para gerar character sheet, captionar, treinar
LoRA e inferir personagem consistente.

Fit para o projeto: muito bom como referencia de arquitetura de producao de
assets. Ruim para runtime: exige GPU pesada, varias chaves/API e treinamento
por personagem. Pode servir para um estúdio offline, nao para o player flow.

### 6. DiceBear / Avatune / Avataaars / Universal LPC

Links:

- https://github.com/dicebear/dicebear
- https://www.avatune.dev/
- https://github.com/fangpenlin/avataaars
- https://github.com/Gaurav0/Universal-LPC-Spritesheet-Character-Generator

Uso potencial: arquitetura deterministica de avatar por camadas, seeds,
opcoes, hair/body/wardrobe e composicao local.

Fit para o projeto: a arte pronta nao combina com The Crew Running, mas a
arquitetura e correta: manifestos de partes, camadas, z-index, seed e previews
pre-gerados. Universal LPC tambem mostra a importancia de metadados/licencas
quando assets externos entram no produto.

### 7. FASHN VTON v1.5 / OpenVTO

Links:

- https://github.com/fashn-AI/fashn-vton-1.5
- https://openvto.com/

Uso potencial: virtual try-on com pessoa + garment.

Fit para o projeto: fraco para agora. E photoreal/fashion oriented, enquanto o
produto precisa comic 2D gritty. Pode inspirar separacao pessoa/garment, mas
nao deve guiar o core visual.

## Arquitetura recomendada

### Modelo de dados vNext

```ts
export type IdentityHairStyleId =
  | 'short-ink'
  | 'curly-cap'
  | 'braids-low'
  | 'buzz-bleach'
  | 'ponytail-teal';

export type BiotypeId =
  | 'compact-light'
  | 'lean-runner'
  | 'balanced-athletic'
  | 'strong-athletic'
  | 'broad-heavy';

export type RunnerIdentityTraits = {
  hairStyleId: IdentityHairStyleId;
  biotypeId: BiotypeId;
  physicalBrief: string;
};

export type SheetSessionRecipe = {
  crewSlug: string;
  renderStyleId: 'street-v2';
  runnerTypeId: string;
  profile: RunnerProfile;
  identity: RunnerIdentityTraits;
  lockedSlots: SlotSelection;
  sheetLayout: '2x2' | '3x3' | '4x4';
  seed: string;
};
```

Importante: `hairStyleId` fica em `identity`, nao em `slots`. Isso permite
voltar com cabelo como escolha do jogador sem violar a ideia de wardrobe
mutavel.

### Sheet session

Em vez de chamar API para cada combinacao:

1. O jogador escolhe crew, perfil, biotipo, cabelo e travas de wardrobe.
2. O app cria uma `SheetSessionRecipe`.
3. O servico gera uma sheet maior em uma unica chamada.
4. O app recorta todas as celulas localmente.
5. Cada crop vira `GeneratedLook`.
6. Trocar look dentro daquela sessao nao chama API.
7. Nova chamada so acontece se mudar identidade, biotipo, cabelo, crew ou
   travas que exigem nova geracao.

### Layout sugerido

Fase 1 segura: `3x3` em 1536x1536 ou 2048x2048 quando o provider permitir.
Se o provider so retornar 1024, manter `2x2`/`3x3` com menos detalhe e escalar
com cuidado.

Fase 2: `4x4` para packs de 16 looks, somente depois de QA provar que o modelo
mantem identidade/corpo/cabelo sem drift.

### Persistencia

Nao usar `localStorage` para guardar muitos PNGs base64.

Proposta:

- `localStorage`: guarda ponteiro/metadata pequeno do runner equipado.
- `IndexedDB`: guarda `SheetSession`, imagem original, crops e thumbnails.
- `sessionHash`: hash estavel da receita para cache/reuso.

### Assets

Separar assets em tres categorias:

- `public/wardrobe/*`: icones de inventario e previews. Nunca entram como
  input de geracao.
- `public/identity/hair/*`: icones de cabelo como UI, tambem nao entram como
  estilo global.
- `public/identity/biotype/*`: silhuetas/previews de biotipo, tambem somente
  UI.

Os inputs visuais de geracao continuam restritos a `public/crews/{crewSlug}/`
via `CrewRenderContext`, salvo se o contrato vNext criar uma excecao explicita
para templates neutros de pose/body que sejam globais e nao-estilo.

## Contrato vNext necessario

Antes de implementar, atualizar `CREATOR_CONTRACT.md` e
`check-creator-contract.mjs` para refletir:

- `StylePicker`, `data/styles.ts` e `public/styles/*` continuam proibidos.
- `slots.hair` continua proibido.
- `identity.hairStyleId` passa a ser permitido.
- `identity.biotypeId` passa a ser permitido.
- Persistencia inclui `identity` e `sheetSessionId`.
- Entre celulas, continuam variando somente wardrobe slots.
- Cabelo, corpo, cabeca e biotipo ficam fixos dentro de uma sheet.
- `TESTAR LOCAL` continua obrigatorio.

## Implementacao em ondas

### Onda A: contrato e schema

- Atualizar contrato executavel.
- Criar `data/identityTraits.ts`.
- Adicionar `identity?: RunnerIdentityTraits` em `SavedCharacter`.
- Criar testes para bloquear `slots.hair` e permitir `identity.hairStyleId`.

### Onda B: UI sem API nova

- Adicionar picker de cabelo e biotipo como parte de identidade.
- Reusar assets UI pre-gerados.
- Atualizar `TESTAR LOCAL` para desenhar biotipo/cabelo escolhido.
- Validar sem alterar provider real.

### Onda C: sheet session/crops/cache

- Criar `SheetSessionRecipe`, `GeneratedLook`, `sheetSessionService`.
- Migrar crops para IndexedDB.
- `saveCharacter` passa a salvar crop equipado + ponteiro da sessao.
- Cache por hash da receita.

### Onda D: geracao real maior

- Ajustar prompt para `3x3`.
- Validar drift de cabelo/corpo/identidade.
- So depois testar `4x4`.

### Onda E: pipeline externo opcional

- Criar um workspace de pesquisa ComfyUI separado do runtime.
- Usar ComfyUI/IPAdapter/ControlNet para produzir packs internos ou validar
  prompts, sem incorporar dependencias pesadas no app.

## Riscos

- `4x4` pode reduzir detalhe e aumentar drift; validar `3x3` primeiro.
- Hair como wardrobe slot quebra a consistencia do personagem; manter em
  `identity`.
- Usar referencia facial de forma muito forte conflita com a regra de nao
  copiar pessoa real.
- Muitos crops em base64 estouram storage; usar IndexedDB.
- Repos externos tem licencas variadas; nao copiar assets sem auditoria.

## Proxima decisao

Decidir se a proxima onda sera:

1. Contrato vNext + schema `identity`.
2. Geracao de assets UI para hair/biotype.
3. Refatoracao de `sheetSession`/IndexedDB antes da UI.

Minha recomendacao: fazer 1, depois 2, depois 3. Sem contrato vNext, qualquer
patch de cabelo vai brigar com o validador e com a regra de produto atual.
