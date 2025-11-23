// data/lenses_and_composition_library.ts

export interface LensCompositionPreset {
  id: string;
  lente: {
    distancia_focal: string;
    comportamento: {
      compressao: 'muito baixa' | 'baixa' | 'baixa-média' | 'média' | 'alta' | 'altíssima';
      distorcao: 'nenhuma' | 'mínima' | 'leve' | 'leve e natural' | 'média' | 'alta';
      bokeh: 'suave' | 'cremoso suave' | 'forte' | 'muito forte';
      profundidade_percebida: 'baixa' | 'média' | 'alta';
      angulo_visao: 'natural' | 'natural-amplo' | 'amplo' | 'ultra-amplo' | 'fechado';
    };
  };
  composicao: {
    angulo: string; // e.g., "low angle 15°", "eye level"
    regra: 'regra_dos_tercos' | 'simetria_perfeita' | 'leading_lines' | 'negative_space' | 'one_point_perspective';
    direcao_linhas: 'diagonais ascendentes' | 'horizontais' | 'verticais' | 'convergentes';
    peso_visual: 'sujeito_à_direita' | 'sujeito_à_esquerda' | 'sujeito_centralizado';
    negativo: 'esquerda' | 'direita' | 'superior' | 'nenhum';
    camadas: string[];
  };
  efeito_emocional: string[];
  uso_ideal: string[];
}

export const lensCompositionLibrary: LensCompositionPreset[] = [
  {
    "id": "35mm_low_angle_editorial",
    "lente": {
      "distancia_focal": "35mm",
      "comportamento": {
        "compressao": "média",
        "distorcao": "mínima",
        "bokeh": "cremoso suave",
        "profundidade_percebida": "alta",
        "angulo_visao": "natural-amplo"
      }
    },
    "composicao": {
      "angulo": "low angle 15°",
      "regra": "regra_dos_tercos",
      "direcao_linhas": "diagonais ascendentes",
      "peso_visual": "sujeito_à_direita",
      "negativo": "esquerda",
      "camadas": ["foreground leve", "midground sujeito", "background suave"]
    },
    "efeito_emocional": ["heroico", "impactante", "moda editorial", "presença forte"],
    "uso_ideal": ["cenas urbanas", "clipes", "moda de rua", "trap elegante"]
  },
  {
    "id": "85mm_eye_level_emotional_closeup",
    "lente": {
      "distancia_focal": "85mm",
      "comportamento": {
        "compressao": "alta",
        "distorcao": "nenhuma",
        "bokeh": "forte",
        "profundidade_percebida": "baixa",
        "angulo_visao": "fechado"
      }
    },
    "composicao": {
      "angulo": "eye level",
      "regra": "regra_dos_tercos",
      "direcao_linhas": "horizontais",
      "peso_visual": "sujeito_centralizado",
      "negativo": "nenhum",
      "camadas": ["midground sujeito", "background totalmente desfocado"]
    },
    "efeito_emocional": ["intimidade", "emoção crua", "foco no olhar", "drama"],
    "uso_ideal": ["close-up emocional", "beauty shots", "diálogo cinematográfico"]
  },
  {
    "id": "24mm_tracking_shot_urban_energy",
    "lente": {
      "distancia_focal": "24mm",
      "comportamento": {
        "compressao": "baixa",
        "distorcao": "leve",
        "bokeh": "suave",
        "profundidade_percebida": "alta",
        "angulo_visao": "amplo"
      }
    },
    "composicao": {
      "angulo": "eye level",
      "regra": "leading_lines",
      "direcao_linhas": "convergentes",
      // FIX: Corrected the 'peso_visual' property to match the allowed type. The 'em movimento' part is implied by the context of this preset.
      "peso_visual": "sujeito_centralizado",
      "negativo": "superior",
      "camadas": ["foreground de rua (postes, pessoas)", "midground sujeito", "background urbano"]
    },
    "efeito_emocional": ["energia", "dinamismo", "imersão", "look de clipe moderno"],
    "uso_ideal": ["tracking shots", "cenas de dança", "moda urbana", "ação"]
  },
  {
    "id": "18mm_low_angle_aggressive_trap",
    "lente": {
      "distancia_focal": "18mm",
      "comportamento": {
        "compressao": "baixa",
        "distorcao": "média",
        "bokeh": "suave",
        "profundidade_percebida": "alta",
        "angulo_visao": "ultra-amplo"
      }
    },
    "composicao": {
      "angulo": "low angle 20°",
      "regra": "simetria_perfeita",
      "direcao_linhas": "diagonais ascendentes",
      "peso_visual": "sujeito_centralizado",
      "negativo": "superior",
      "camadas": ["foreground chão/asfalto", "midground sujeito", "background teto/céu distorcido"]
    },
    "efeito_emocional": ["poder", "dominação", "agressividade", "energia caótica"],
    "uso_ideal": ["funk", "trap", "cenas de perseguição", "vibe agressiva"]
  }
];
