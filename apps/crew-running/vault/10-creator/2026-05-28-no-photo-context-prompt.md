# Superseded Context Prompt

Data: 2026-05-28
Escopo: `apps/crew-running`

Este prompt foi encerrado. Nao usar para continuar trabalho.

Prompt de continuidade atual:

```text
Estamos no mini app The Crew Running em /Users/belissima/Desktop/running crew/apps/crew-running.

Objetivo atual:
Manter o Runner Creator travado em crew escolhida no onboarding, com upload de rosto obrigatorio, runner profile, RunnerTypePicker, wardrobe top/bottom/shoes/accessory e render fixo street-v2.

Contrato obrigatorio:
- A crew escolhida no onboarding trava tema, assets e paleta.
- Render style continua fixo em street-v2.
- Nao voltar StylePicker nem data/styles.ts.
- Nao criar slot de cabelo; slots validos: top, bottom, shoes, accessory.
- Nao reabrir caminho publico de identidade por texto.
- Foto e referencia fisica ampla; nao copiar rosto/identidade real.

Validacao obrigatoria:
cd "/Users/belissima/Desktop/running crew/apps/crew-running"
npm run validate
git diff --check -- apps/crew-running .github AGENTS.md
```
