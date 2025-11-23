// data/ImageScience_4K_V1_0.ts

const ImageScience_4K_V1_0 = `
## BIBLIOTECA 14 — A CIÊNCIA DA IMAGEM 4K

Este documento ensina a IA os princípios fundamentais de uma imagem 4K cinematográfica real, focando em qualidade óptica e realismo em vez de simples nitidez digital.

### 1. DEFINIÇÃO TÉCNICA REAL DE 4K

Resolução não é tudo. 4K não é apenas sobre o tamanho (4096x2160 ou 3840x2160). É sobre a pureza da informação em cada pixel. Uma imagem pode ter alta resolução e parecer de baixa qualidade devido a compressão, ruído falso ou nitidez artificial.

### 2. POR QUE IA ERRA “4K”

A IA tende a interpretar "4K" como "extremamente nítido", o que leva a erros como:
- ❌ sharpen exagerado
- ❌ texturas artificiais e plásticas
- ❌ contraste duro demais
- ❌ aberração cromática falsa
- ❌ “overdetailing” (excesso de detalhes) que quebra o realismo

### 3. OS 12 PILARES DE UMA IMAGEM 4K DE VERDADE

1.  **Pureza do pixel:** Sem ruído artificial ou sharpening excessivo.
2.  **Dinâmica de luz real:** Sombras suaves, altas luzes controladas sem estourar.
3.  **Microtexturas coerentes:** Pele com poros, tecido com fibras, materiais com física correta.
4.  **Profundidade óptica (não digital):** Profundidade de campo (DOF) que simula uma lente real.
5.  **Gradientes sem banding:** Transições de cor suaves e contínuas.
6.  **Acurácia de cor cinematográfica:** Cores realistas, não hipersaturadas.
7.  **Nitidez óptica, não digital:** A nitidez deve parecer vir do foco da lente, não de um filtro de software.
8.  **Microcontraste verdadeiro:** Detalhes visíveis nas áreas de sombra, sem destruir a textura.
9.  **Resolução espacial real:** Objetos distantes devem ser legíveis, mas com a perda de detalhe natural da distância.
10. **Detalhes coerentes com física real:** Sem padrões repetitivos ou detalhes "inventados".
11. **Foco contínuo:** Transição suave e natural entre áreas focadas e desfocadas.
12. **Compressão mínima:** Sem artefatos de compressão visíveis (blocos, etc.).

### 4. SCHEMA TÉCNICO PARA ENSINAR AO SISTEMA O QUE É 4K

\`\`\`json
{
  "qualidade_4k_real": {
    "pixel_purity": "alta",
    "micro_texturas": "coerentes_fisicamente",
    "nitidez": "optica_suave",
    "contraste": "microcontraste_verdadeiro",
    "profundidade": "lente_real",
    "gradiente": "suave_sem_banding",
    "cores": "cinematograficas",
    "compressao": "minima",
    "detalhe_fundo": "legivel_com_coerencia",
    "materialidade": "realista_por_fisica_optica",
    "artefatos": "zero",
    "overdetail": "proibido"
  }
}
\`\`\`

### 5. REGRAS DE COMPOSIÇÃO DE UMA IMAGEM 4K

- **Regra da Nitidez Distribuída:** Nem tudo pode estar 100% nítido. A nitidez deve seguir a área de foco da lente.
- **Regra do Microcontraste:** Contraste nos detalhes finos, não um aumento geral do contraste que esmaga as sombras.
- **Regra do Plano Óptico:** A imagem deve simular compressão de lente, distância focal e desfoque óptico precisos.
- **Regra do Material Real:** Cada material deve reagir à luz de forma autêntica (nylon com highlights lineares, couro com brilho difuso, etc.).

### 6. ERROS PROIBIDOS NA PIPELINE 4K

- ❌ “super nítido”
- ❌ pele de plástico
- ❌ exagero de microdetalhes irreais
- ❌ textura inventada
- ❌ halo de nitidez
- ❌ contornos muito fortes
- ❌ luz dura demais sem motivo
- ❌ ruído digital falso
`;

export default ImageScience_4K_V1_0;
