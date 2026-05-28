# /public assets

Coloque os PNGs gerados (via prompts em ../PROMPTS.md) aqui:

- `brand/logo.png` — header / gate logo
- `brand/splash.png` — splash screen
- `wardrobe/top/*.png` — 4 ícones de top
- `wardrobe/bottom/*.png` — 4 ícones de bottom
- `wardrobe/shoes/*.png` — 4 ícones de tênis
- acessórios atuais usam fallback textual, sem PNG obrigatório
- `crews/{slug}/*.png` — contexto visual travado por crew para o creator
- `textures/board.png` — textura de chalkboard (opcional)
- `backgrounds/*.jpg` — backdrops 2D de boot, city signal, HQ e textura street
- `ui/button-atlas-v1*.png` — referência visual do sistema de botões

Os componentes do app referenciam estes caminhos via `iconUrl` nos
arquivos em `data/`. Sem os arquivos, mostram placeholder textual.
