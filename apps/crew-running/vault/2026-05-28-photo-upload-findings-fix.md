# The Crew Running - Correcao Dos Findings De Foto

Data: 2026-05-28
Base: revisao de `components/PhotoUpload.tsx`
Status: executado e validado.

## Findings corrigidos

1. MIME vazio em camera/mobile podia ser rejeitado indevidamente.
2. Preview da selfie tinha aparencia clicavel, mas nao acionava troca.
3. Foco de teclado estava no input invisivel, sem feedback no controle visivel.

## Mudancas aplicadas

- `PhotoUpload` agora rejeita apenas MIME explicitamente nao-imagem.
- Arquivos sem MIME podem ser aceitos quando a extensao indica imagem.
- MIME final e inferido por:
  - `file.type` quando e `image/*`;
  - MIME do `dataUrl` quando disponivel;
  - extensao conhecida;
  - fallback `image/jpeg`.
- Card vazio com `+` virou label funcional para upload.
- Preview com selfie virou label funcional para troca da foto.
- `runner-creator__photo-block` recebeu z-index proprio para impedir sobreposicao da ficha nos botoes.
- Foco visual passou para `:focus-within` nos labels visiveis.

## Validacao tecnica

```bash
cd "/Users/belissima/Desktop/running crew/apps/crew-running"
npm run build
```

Resultado: passou.

## Smoke funcional

Validado no runtime `http://127.0.0.1:3104/` com Playwright direto:

- card `+` abre chooser e aceita arquivo `.jpg` com MIME vazio;
- preview `TROCAR SELFIE` abre chooser;
- `TROCAR ARQUIVO` abre chooser sem ficar coberto pela ficha;
- `TIRAR NOVA` abre chooser com `capture="user"`;
- arquivo com MIME `text/plain` e extensao `.png` exibe erro e nao vira selfie;
- foco no input invisivel aplica outline no label visivel.

Resultado observado:

```json
{
  "ok": true,
  "focusOutline": {
    "outlineColor": "rgb(52, 217, 202)",
    "outlineStyle": "solid",
    "outlineWidth": "3px"
  }
}
```

## Evidencia visual atualizada

- `output/playwright/photo-upload-buttons-fixed.png`
