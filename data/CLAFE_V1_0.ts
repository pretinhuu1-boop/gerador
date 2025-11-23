// data/CLAFE_V1_0.ts

const CLAFE_V1_0 = `
## BIBLIOTECA 11 — LUZ AVANÇADA & ATMOSFERA
(Cinematic Light & Atmos FX Engine - CLAFE)

Esta biblioteca ensina a IA a fazer:

* luz realista
* luz emocional
* luz narrativa
* luz que escultura o rosto
* luz que cria profundidade
* contraluz cinematográfica
* haze, fog, partículas
* volumetria
* backlight estético
* atmosfera que vive e respira

Esta é a biblioteca de iluminação mais densa do sistema.

### 1. SCHEMA TÉCNICO OFICIAL DE LUZ & ATMOSFERA

Toda luz da cena deve seguir esse documento:

\`\`\`json
{
  "key_light": {
    "type": "soft_box",
    "position": "45_degree_right",
    "height": "2m",
    "intensity": "650 lux",
    "temperature": "4200K",
    "falloff": "soft",
    "spread": "medium"
  },
  "fill_light": {
    "type": "bounce_board",
    "intensity": "30%",
    "temperature": "neutral"
  },
  "rim_light": {
    "type": "led_bar",
    "position": "back_left",
    "intensity": "40%",
    "temperature": "5600K"
  },
  "ambient_light": {
    "type": "practical_neon",
    "color": "#2aa9ff",
    "intensity": "low"
  },
  "haze": "medium",
  "volumetric_beams": true,
  "particles": "soft_dust",
  "atmosphere": "humid",
  "shadow_behavior": "cinematic_soft_shadows"
}
\`\`\`

### 2. OS 12 FUNDAMENTOS DE LUZ CINEMATOGRÁFICA

1.  Direção da luz
2.  Qualidade da luz (soft / hard)
3.  Altura da luz
4.  Temperatura de cor
5.  Relação Key/Fill
6.  Contraste
7.  Diffusion
8.  Wrap da luz no rosto
9.  Luz prática (luzes no cenário)
10. Separação de planos
11. Backlight / Rimlight
12. Atmosfera (haze, fog, particulado)

Tudo isso tem que ser respeitado SEMPRE.

### 3. 10 MODELOS DE ILUMINAÇÃO DO ROSTO (ULTRA PROFISSIONAL)

1.  **Rembrandt:** Triângulo de luz abaixo do olho. Cinema clássico.
2.  **Butterfly:** Luz alta, sombra simétrica sob o nariz. Editorial.
3.  **Loop Light:** Sombra pequena ao lado do nariz. Natural.
4.  **Split Light:** Metade do rosto na sombra. Dramático.
5.  **Soft Top Light:** Luz difusa de cima. Look fotógrafo high-end.
6.  **Edge Light:** Contorno pela lateral. Moda e clipe.
7.  **Hard Side Light:** Forte de lado. Gritty urbano.
8.  **Underlight (teatral):** De baixo. Indica tensão/surpresa.
9.  **Broad / Short Light:** Luz na parte larga do rosto / parte curta. Controla forma.
10. **Triple Light Editorial (Ammar style):** Key suave + rim forte + neon ambiental.

### 4. SISTEMA DE VOLUMETRIA & ATMOSFERA

Volumetria cria “luz viva”.

**Componentes:**
- **Haze (neblina leve):** espalha a luz, cria feixes (volumetric beams), adiciona camada cinematográfica. Níveis: leve, médio, pesado.
- **Fog (nevoeiro denso):** muito dramático, altera o clima, ideal para cena emocional ou sombria.
- **Particles:** poeira, umidade, partículas douradas (editorial sunset), cinzas, pequenas gotas no ar.
- **Luz volumétrica:** Criada quando há haze, luz direta forte e contraste.

**Regras:**
- Volumetria nunca se move por “vontade própria”; ela reage à luz e movimento da câmera.
- Partículas se movem lentamente, nunca rápido.

### 5. SISTEMA DE LUZ EMOCIONAL (MOOD → ILUMINAÇÃO)

A emoção define a luz:
- **Determinação:** key dura, contraste alto, sombra definida, 4500–5200K.
- **Tristeza:** luz suave, baixa intensidade, 3500–4200K.
- **Poder:** rim forte, luz lateral, textura alta, 5000–6500K.
- **Sedução:** key suave, highlight suave, 2800–3500K.
- **Confiança:** luz frontal, contraste médio, 4200–5000K.

### 6. TEMPERATURA DE COR AVANÇADA (CCT → LUT NATURAL)

A IA deve entender:
- 2000K — fogo, âmbar profundo
- 2800K — tungsteno quente
- 3500K — comercial suave
- 4200K — cinema neutro quente
- 5600K — daylight cinematográfico
- 6500K — clean, frio, futurista
- 9000K — azul acentuado

**Regras:**
- Pele quente, ambiente frio = contraste elegante.
- Pele fria, ambiente quente = narrativa elegante e moderna.
- Highlights devem ter cor consistente.

### 7. COMPORTAMENTO DA LUZ EM MATERIAIS

- **Pele:** SSS (subsurface scattering), highlights suaves, brilho natural na testa, poros evidentes.
- **Tecidos:** seda → highlight longo; jeans → textura de sombra; couro → contraste + highlight pequeno; nylon → reflexo direcional.
- **Metal:** reflexo especular, arranhões, micro-detalhes.
- **Vidro:** refração, neblina interna, highlight duro.

### 8. LUZ POR CATEGORIA

- **Cinema:** contraste dramático, luz naturalista, volumetria suave, sombras texturizadas.
- **Videoclipe:** neon, rim forte, atmosfera carregada, luz impactante.
- **Moda:** luz perfeita no rosto, sombras suaves, volumetria mínima, cor controlada.
- **Branding:** clean, suave, ambiente claro, atmosfera mínima, produto iluminado perfeitamente.

### 9. ERROS PROIBIDOS DA IA EM LUZ

- ❌ highlight explodido
- ❌ pele brilhando demais
- ❌ luz dura sem sombra coerente
- ❌ luz sem direção
- ❌ volumetria exagerada
- ❌ haze demais
- ❌ cor sem consistência
- ❌ neons sem atmosfera
- ❌ sombra desenhada artificialmente

### 10. INTEGRAÇÃO

- **SIB:** determina o clima, define temperatura e cor, escolhe densidade de atmosfera.
- **Decoupage:** aplica luz a cada frame, garante consistência, controla sombra e volume, escolhe modelo de rosto.
- **Video Engine:** faz a luz respirar, anima a volumetria, reage ao movimento da câmera, aprofunda atmosfera.
`;

export default CLAFE_V1_0;
