// data/CME_V1_0.ts

const CME_V1_0 = `
## BIBLIOTECA 10 — COMPORTAMENTO DA CÂMERA (Cinematic Motion Engine - CME)

Este documento é a autoridade máxima em cinematografia. A IA deve usar este guia para todas as decisões de câmera, lente e composição.

### 1. SCHEMA TÉCNICO OFICIAL

Toda instrução de câmera deve seguir esta estrutura:

\`\`\`json
{
  "camera_position": "slightly_low",
  "camera_height": "1.45m",
  "camera_distance": "1.2m",
  "camera_angle": "3_degree_tilt_up",
  "movement_type": "slow_dolly_in",
  "movement_speed": "0.15m_per_second",
  "lens": {
    "focal_length": "35mm",
    "aperture": "f1.8",
    "depth_of_field": "shallow",
    "distortion_profile": "neutral"
  },
  "framing": "medium_close_up",
  "composition": "rule_of_thirds_break_left",
  "focus_behavior": "rack_focus_environment_to_eyes",
  "intent": "aproximacao_emocional"
}
\`\`\`

### 2. AS 12 LINGUAGENS UNIVERSAIS DE CÂMERA

- **Observacional:** câmera neutra, sem interferir.
- **Intimista:** muito próxima, respira junto.
- **Heroica:** levemente baixa, engrandece o ator.
- **Voyerista:** de longe, como se observasse escondido.
- **Dramática:** ângulos inclinados, tensão.
- **Poética:** movimentos lentos e metáforas visuais.
- **Documental:** mão leve, quase imperfeita.
- **Comercial:** precisa, limpa, objetiva.
- **Futurista:** movimentos orbitais, fluidez robótica.
- **Urbano Gritty:** tracking sujo, perto do chão.
- **Editorial Moda:** estática, composição perfeita.
- **Videoclipe:** dinâmica, ritmo, troca de distância.

### 3. OS 30 MOVIMENTOS DE CÂMERA CANÔNICOS

- **Lineares:** Dolly In/Out, Push In/Pull Back, Truck Left/Right, Pedestal Up/Down.
- **Orbitais:** Orbit Slow/Medium/Tight, Micro Orbit, Parallax Shift.
- **Angulares:** Tilt Up/Down, Pan Left/Right, Dutch Tilt, Contra-Plongée, Plongée.
- **Avançados:** Rack Focus, Follow Focus, Gimbal Smooth Drift, Handheld Micro Jitter, Whip Pan/Tilt, Static Lock.

### 4. SISTEMA DE LENTES (PSICOLOGIA)

- **18mm-21mm:** Grande angular dramática, energia urbana (ideal para Frame 1).
- **24mm:** Cinema moderno, natural, presença.
- **28mm–35mm:** Equilíbrio perfeito, intimidade + contexto (ideal para Frame 2).
- **50mm:** Intensidade emocional, rosto perfeito, zero distorção (ideal para Frame 3).
- **85mm–135mm:** Editorial/moda, separação do fundo, close poderoso.

### 5. RELAÇÃO CÂMERA ↔ ATOR (PROGRESSÃO OBRIGATÓRIA DE 3 FRAMES)

1.  **Observa:** Câmera vê o ator, ator ignora (Frame 1).
2.  **Conecta:** Câmera se aproxima ou muda lente, ator percebe e há uma troca emocional (Frame 2).
3.  **Domina:** Close final, câmera entrega o poder ao ator, que domina a lente (Frame 3).

### 6. COMPOSIÇÃO PROFISSIONAL (REGRAS + RUPTURAS)

- **Regras Clássicas:** Rule of thirds, leading lines, negative space, depth layering.
- **Rupturas Modernas:** Cortar topo da cabeça, enquadrar baixo, foco no ombro, elementos na frente da câmera.

### 7. ERROS PROIBIDOS DA IA EM CÂMERA

- ❌ zoom digital (não existe no cinema)
- ❌ câmera parada demais sem intenção
- ❌ ângulos impossíveis
- ❌ distorções exageradas
- ❌ mudança brusca de lente
- ❌ movimento sem relação com ator
- ❌ foco automático “pulando”
- ❌ câmera “flutuar” de modo não físico

`;

export default CME_V1_0;
