# /public assets

Coloque os PNGs gerados (via prompts em ../PROMPTS.md) aqui:

- `brand/logo.png` — header / gate logo
- `brand/splash.png` — splash screen
- `wardrobe/hair/*.png` — 4 ícones de cabelo
- `wardrobe/top/*.png` — 4 ícones de top
- `wardrobe/bottom/*.png` — 4 ícones de bottom
- `wardrobe/shoes/*.png` — 4 ícones de tênis
- `styles/*.png` — 4 thumbnails de estilo de arte
- `textures/board.png` — textura de chalkboard (opcional)

Os componentes do app referenciam estes caminhos via `iconUrl` nos
arquivos em `data/`. Sem os arquivos, mostram placeholder textual.
