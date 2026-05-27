# The Crew Running — Customize

Mini-app de customização de personagem que recebe uma foto da pessoa
e gera um character sheet 2×2 com 4 looks (cabelo + top + bottom + tênis)
usando Gemini 2.5 Flash Image.

## Como rodar

```bash
cd apps/crew-running
npm install
npm run dev
```

Abre em `http://localhost:3100`. Cole sua Gemini API key (gratuita em
`aistudio.google.com/apikey`) — ela fica só no `localStorage` do navegador.

## Fluxo

1. Cola a API key.
2. Faz upload de uma selfie.
3. Escolhe um dos 4 estilos (Street Comic, Graffiti Poster, Anime Runner, Bold Mascot).
4. Opcional: trava itens específicos do guarda-roupa (ex: "quero esse hoodie").
5. Clica **GERAR SHEET 2×2** → 1 chamada à API devolve 1 imagem com 4 variações.
6. Clica no look favorito → salva no `localStorage` como "Seu Personagem".

## Arquitetura

- `data/wardrobe.ts` — catálogo de 4 itens por slot (hair/top/bottom/shoes).
- `data/styles.ts` — 4 estilos de arte.
- `services/crewService.ts` — monta prompt mestre + chama `gemini-2.5-flash-image`.
- `services/storage.ts` — wrappers de localStorage.
- `components/*` — UI desacoplada por seção.

## Deploy na Vercel (projeto separado)

Esse app tem o próprio `vercel.json`. Pra publicar como projeto Vercel
independente do gerador de flyer:

1. No dashboard da Vercel: **Add New → Project → Import** este repo.
2. Em **Root Directory**, clique **Edit** e selecione `apps/crew-running`.
3. Framework Preset = **Vite** (auto-detectado).
4. Build Command, Output Directory e Install Command já vêm do `vercel.json`.
5. Deploy. O preview por PR vai apontar pra este app a partir daí.

## Por que 2×2 numa chamada só?

Gemini 2.5 Flash Image entrega 1 imagem por requisição. Pedir um "character
sheet 2×2" coloca 4 variações na mesma resposta — economiza 75% das chamadas
em relação a gerar uma imagem por look. Acima de 3×3 a qualidade dos detalhes
de roupa cai.
