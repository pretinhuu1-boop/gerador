# The Crew Running - Correcao Botoes De Foto

Data: 2026-05-28
App: `apps/crew-running`
Runtime validado: `http://127.0.0.1:3104/`
Status: executado e validado.

## Problema

Os comandos de foto dependiam de `inputRef.current?.click()` em
`components/PhotoUpload.tsx`.

Esse padrao e fragil em browser/mobile porque o seletor de arquivo/camera pode
ser bloqueado quando o click real do usuario nao cai diretamente no
`input[type=file]`.

## Mudanca aplicada

- `PhotoUpload` deixou de usar click programatico no input escondido.
- Foram criados dois controles nativos:
  - `TIRAR FOTO`: `input type=file accept=image/* capture=user`;
  - `SUBIR FOTO`: `input type=file accept=image/*`.
- Cada controle fica dentro do proprio botao visual, com o input ocupando toda
  a area clicavel.
- O preview agora mostra `SELFIE ENVIADA` e mantem acoes:
  - `TIRAR NOVA`;
  - `TROCAR ARQUIVO`.
- Adicionado feedback local para arquivo invalido ou falha de leitura.

## Arquivos alterados

- `components/PhotoUpload.tsx`
- `index.css`

## Validacao tecnica

```bash
cd "/Users/belissima/Desktop/running crew/apps/crew-running"
npm run build
```

Resultado: passou.

## Smoke funcional

Fluxo validado com Playwright direto no Chrome:

1. `PULAR` intro.
2. `PULAR INTRO`.
3. Abrir aba `RUNNER`.
4. `COMEÇAR`.
5. `PULAR TUTORIAL`.
6. Clicar `SUBIR FOTO` e setar imagem local.
7. Confirmar UI em `SELFIE ENVIADA` / `TROCAR ARQUIVO`.
8. Clicar `TIRAR NOVA` e setar outra imagem local.
9. Confirmar que o input de camera tem `capture="user"`.

Resultado:

```json
{
  "ok": true,
  "inputs": [
    {
      "aria": "Tirar nova foto do rosto",
      "accept": "image/*",
      "capture": "user"
    },
    {
      "aria": "Trocar arquivo da selfie",
      "accept": "image/*",
      "capture": null
    }
  ]
}
```

## Evidencia visual

- `output/playwright/photo-upload-buttons-fixed.png`

## Observacao

O teste foi feito no app Vite ativo em `apps/crew-running`, que estava servindo
na porta `3104`.
