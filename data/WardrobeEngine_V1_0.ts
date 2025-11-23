// data/WardrobeEngine_V1_0.ts

const WardrobeEngine_V1_0 = `
## BIBLIOTECA 13 – FIGURINO & ESTÉTICA VISUAL (Wardrobe Engine)

### 1. OBJETIVO DO MÓDULO

Transformar o figurino em um elemento narrativo, estético, editorial e cinematográfico, garantindo coerência com o personagem, preset, história e movimento da câmera. O figurino deve interagir com a cena.

### 2. SCHEMA OFICIAL DO FIGURINO PARA A PIPELINE
\`\`\`json
{
  "figurino": {
    "categoria": "trap_cinematico",
    "camadas": {
      "superior": {
        "peca": "jaqueta bomber premium",
        "material": "nylon tecnico",
        "cor": "preto_jato",
        "acabamento": "fosco_com_detalhes_brillants",
        "movimento": "micro_oscilacao_controlada"
      },
      "inferior": {
        "peca": "cargo pants oversized",
        "material": "sarja pesada",
        "cor": "preto_envelhecido",
        "movimento": "baixo"
      },
      "calcado": {
        "peca": "tênis chunky trap",
        "cor": "preto_ou_branco",
        "detalhes": "sola_larga"
      },
      "acessorios": {
        "correntes": "ouro 18k",
        "anel": "oversized",
        "pulseira": "dourada",
        "grillz": "full_gold",
        "elemento_iconico": "ornamentos_tranca"
      }
    },
    "texturas": {
      "superior": "fibra_tecnica_mate",
      "inferior": "sarja_com_grain",
      "pele": "poros_visiveis",
      "metal": "reflexo_suave_realista"
    },
    "coerencia_cena": true,
    "coerencia_movimento_camera": true
  }
}
\`\`\`

### 3. BIBLIOTECA DE ESTILOS DE FIGURINO
1) **Trap Moderno Internacional (US – premium):** jaquetas oversized, couro premium, nylon técnico, correntes pesadas, paleta: preto, cinza aço, dourado.
2) **Fashion Trap Cinemático:** peças editoriais de moda, modelagens amplas, texturas premium, vibe “editorial da Vogue + trap”.
3) **Trap BR Realista:** regatas, bermudas oversized, chinelo ou tênis vulcanizado, correntes menores, jaqueta de nylon clássico.
4) **Street High Fashion:** camadas (hoodie + bomber + colete tático), sneakers de luxo.
5) **Techwear / Cyber Trap:** tecidos técnicos, tiras, zíperes, sobreposições, preto fosco + metal.

### 4. COMO O FIGURINO INTERAGE COM A CENA
- **Movimento:** nylon balança com micro-vento, sarja quase não se mexe, correntes têm micro-balanço sincronizado com respiração, grillz responde à luz com reflexo calculado. Tecido nunca “flutua”.
- **Iluminação:** tecidos mate absorvem luz, nylon técnico cria highlights lineares, metal cria flare suave.

### 5. INTEGRAÇÃO NO SISTEMA
- **Decoupage:** Define o figurino, luz, movimento e textura para cada frame, garantindo continuidade.
- **Frames:** Cada frame deve conter a leitura física do figurino.
- **Video Engine (Veo):** Anima o figurino com física real (vento, balanço de correntes, micro movimento do tecido).
`;

export default WardrobeEngine_V1_0;
