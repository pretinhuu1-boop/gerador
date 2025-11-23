// data/DOC_010.ts

const content = `## Guia de Construção de Micro-Cenas Loopáveis com IA

### 1. Visão Geral

Este documento ensina a IA a criar **cenas curtas de clipe (loops cinematográficos)** com base em **uma foto do artista** e **o logo**. O processo ocorre em duas etapas principais:

1. **Criação Estática (NanoBanana)** – geração da imagem base com realismo, textura e estilo.
2. **Animação Loopável (Veo 3.1)** – criação do movimento curto e contínuo, que se repete sem cortes perceptíveis.

O objetivo é gerar pequenos trechos de clipe que pareçam reais e vivos, mesmo sendo criados a partir de uma imagem estática.

---

### 2. Estrutura do Processo

#### Etapa 1 — Criação da Cena Estática (NanoBanana)

A IA deve interpretar a foto do artista e o logo como elementos centrais e, com base nisso, **construir uma cena coerente com o estilo musical e a estética urbana**.

**Entrada:**

* Foto do artista (retrato frontal, meio corpo ou close-up)
* Logo (opcional)
* Preset de ambiente (ex: palco, rua, carro, mar, estúdio)

**Ações:**

1. Reconhecer traços principais do rosto, vestimenta e acessórios.
2. Gerar fundo e iluminação coerentes com o preset.
3. Aplicar textura e cor de acordo com o estilo (ex: funk, trap, rap).
4. Integrar o logo como elemento visual secundário.

**Parâmetros visuais obrigatórios:**

* **Resolução mínima:** 4K.
* **Texturas:** pele, tecido, vidro, metal, fumaça e luz.
* **Iluminação:** realista, volumétrica e contextual.
* **Estilo estético:** urbano, cinematográfico, grão leve, contraste forte.

---

#### Etapa 2 — Animação e Loop (Veo 3.1)

Após gerar a cena estática, a IA deve criar **um movimento suave e curto (2 a 5 segundos)** que possa ser repetido infinitamente.

**Ações da IA:**

1. Detectar os elementos móveis possíveis (cabeça, mãos, objetos, câmera, luz, vento, fumaça, etc.).
2. Aplicar microanimações com base na ação desejada (ver lista abaixo).
3. Fazer o final da animação coincidir com o início, garantindo **loop contínuo**.
4. Adicionar micro variações (respiração, piscada, vibração, tremor leve) para evitar aparência robótica.

**Duração padrão do loop:** 4 a 6 segundos.

---

### 3. Tipos de Cenas e Movimentos

#### A) Veículos e Movimento

1. **Dirigindo um carro**

   * Movimento: cabeça vira levemente, mão ajusta o volante.
   * Loop: volta à posição inicial sem corte.
   * Efeitos: reflexos da cidade no vidro, luz pulsando.

2. **Pilotando moto**

   * Movimento: corpo inclina, corrente balança, vento nas roupas.
   * Loop: retorno à posição original.

3. **Pilotando jetski**

   * Movimento: acelera leve, levanta água, respingos desaparecem.
   * Loop: reinício no mesmo ponto.

---

#### B) Palco e Performance

1. **Cantando no palco**

   * Movimento: levanta o microfone, mexe o corpo, volta.
   * Luzes piscam com o beat.

2. **DJ tocando**

   * Movimento: gira botão da controladora, ajusta fone, levanta a mão.
   * Loop: continuidade natural.

---

#### C) Lifestyle e Close-Up

1. **Mexendo no óculos**

   * Movimento: mão toca o óculos, ajusta, volta.
   * Loop: ação contínua, natural.

2. **Fumando / soltando fumaça**

   * Movimento: traga e exala fumaça.
   * Loop: fumaça se dissipa no mesmo ponto do início.

---

#### D) Rua e Cotidiano

1. **Encostado no carro / muro**

   * Movimento: respiração, olhar pro lado, corrente mexe.
   * Loop: retorna ao ponto inicial.

2. **Esquina / posto / rua noturna**

   * Movimento: luzes piscam, vento, câmera balança leve.
   * Loop: luz final igual à inicial.

---

### 4. Estrutura Técnica do Loop

Cada loop deve seguir esta estrutura:

\`\`\`json
{
  "scene_type": "DJ adjusting glasses on stage",
  "duration": 5,
  "loop": "seamless",
  "camera": {
    "angle": "medium close-up",
    "movement": "slow dolly in/out",
    "depth": "shallow f/1.8"
  },
  "artist_action": {
    "motion": "raises right hand to adjust glasses, nods slightly, returns to neutral",
    "timing": "2.5s action, 2.5s reset"
  },
  "environment": {
    "lighting": "neon blue and magenta, volumetric haze",
    "textures": ["skin pores", "fabric weave", "glass reflection"],
    "background": "smoke, crowd silhouettes, LED flashes"
  },
  "style": {
    "palette": ["#0a0a0a", "#4f3bff", "#e58e26"],
    "grain": "medium",
    "vibe": "urban cinematic"
  }
}
\`\`\`

---

### 5. Regras de Continuidade

* **Sempre iniciar e terminar com o mesmo enquadramento.**
* **Evitar deslocamento total do corpo ou da câmera.** Apenas micro movimentos.
* **Usar iluminação e partículas (fumaça, poeira, luz) para mascarar o corte do loop.**
* **Aplicar variações no tempo:** uma cena pode durar 3s, 5s, 8s, mas deve ter sempre ponto de reinício perfeito.

---

### 6. Estilo Visual Padrão

A estética base deve sempre respeitar o universo urbano musical:

* Paleta: preto fosco, ferrugem, lilás frio, concreto e reflexos metálicos.
* Iluminação: neon azul/magenta ou dourado/laranja.
* Textura: grão cinematográfico leve.
* Movimento: fluido, realista, com energia contida.

---

### 7. Integração no Aplicativo

Quando o usuário enviar foto + logo:

1. O app chama o **preset de ambiente** (palco, rua, estúdio, veículo, etc.).
2. O **NanoBanana** gera o frame base, aplicando estilo e integração.
3. O **Veo 3.1** anima conforme o modelo JSON da cena selecionada.
4. O sistema exporta o loop pronto (4–6s) e permite gerar variações automáticas.

---

### 8. Exemplos de Templates Prontos

#### 1. Artista dirigindo carro

\`\`\`json
{"scene_type":"driving car","movement":"head tilt + steering wheel adjustment","lighting":"city reflections, neon blue and orange","duration":5,"loop":"seamless"}
\`\`\`

#### 2. Pilotando moto

\`\`\`json
{"scene_type":"motorbike ride","movement":"body lean and helmet tilt","lighting":"streetlights and asphalt reflections","duration":4,"loop":"seamless"}
\`\`\`

#### 3. Pilotando jetski

\`\`\`json
{"scene_type":"jetski","movement":"splash and head turn","lighting":"sunset glow over water","duration":5,"loop":"seamless"}
\`\`\`

#### 4. Cantando no palco

\`\`\`json
{"scene_type":"on stage singing","movement":"microphone lift, head nod, light pulse","lighting":"spotlight with crowd silhouettes","duration":5,"loop":"seamless"}
\`\`\`

#### 5. DJ tocando

\`\`\`json
{"scene_type":"DJ performing","movement":"hand moves on controller, raises arm, nods to beat","lighting":"laser flashes and LED walls","duration":5,"loop":"seamless"}
\`\`\`

#### 6. Mexendo no óculos

\`\`\`json
{"scene_type":"adjusting glasses","movement":"hand touches sunglasses, small head tilt","lighting":"neon reflections, shallow DOF","duration":4,"loop":"seamless"}
\`\`\`

#### 7. Fumando

\`\`\`json
{"scene_type":"smoking","movement":"inhale, exhale smoke dissipates","lighting":"low light, haze and reflections","duration":5,"loop":"seamless"}
\`\`\`

#### 8. Encostado no carro

\`\`\`json
{"scene_type":"leaning on car","movement":"head turn, necklace swing, breathing motion","lighting":"street neon, reflections on car","duration":5,"loop":"seamless"}
\`\`\`

#### 9. Esquina urbana

\`\`\`json
{"scene_type":"street corner","movement":"light flicker, wind, camera micro-pan","lighting":"city ambient, cars passing light","duration":4,"loop":"seamless"}
\`\`\`

#### 10. Close-up respiração

\`\`\`json
{"scene_type":"close-up breathing","movement":"breath, subtle blink, camera breathing","lighting":"soft fill light, cinematic grain","duration":4,"loop":"seamless"}
\`\`\`

---

### 9. Expansões Futuras

* Reconhecimento automático de expressão facial para loops personalizados (ex: sorriso, olhar).
* Geração de partículas dinâmicas (chuva, poeira, faísca, fumaça, LED flashes).
* Presets temáticos (baile funk, trap club, praia, garagem, palco grande).

---

### 10. Conclusão

A IA deve sempre priorizar **realismo, fluidez e estética urbana cinematográfica**. O loop precisa parecer uma cena de clipe profissional, mesmo que dure apenas 4 segundos.

A combinação NanoBanana + Veo 3.1 transforma fotos em pequenas realidades em movimento — e cada preset é uma porta de entrada para uma nova performance visual.
`;

export default content;
