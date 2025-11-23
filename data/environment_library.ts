// data/environment_library.ts

export interface EnvironmentPreset {
  id: string;
  nome: string;
  categoria: 'Urbano' | 'Interior' | 'Industrial' | 'Moda' | 'Musical' | 'Natureza' | 'Comercial';
  descricao: string;
  camadas: {
    foreground: string[];
    midground: string[];
    background: string[];
  };
  iluminacao_motivada: {
    key: string;
    rim: string;
    fill: string;
    practicals: string[];
  };
  texturas_dominantes: string[];
  atmosfera: {
    haze: 'nenhum' | 'fino' | 'médio' | 'denso';
    vapor: 'nenhum' | 'baixo' | 'moderado' | 'alto';
    particulas: 'nenhuma' | 'baixas' | 'médias' | 'altas';
  };
  comportamento_camera: {
    melhor_combinacao: string[];
    movimentos_proibidos: string[];
  };
  regras_continuidade: {
    temperatura: 'quente' | 'neutra' | 'fria';
    luminosidade: 'baixa' | 'média' | 'alta';
    contraste: 'baixo' | 'médio' | 'alto';
    humidade: 'baixa' | 'média' | 'alta';
  };
}

export const environmentLibrary: EnvironmentPreset[] = [
  {
    "id": "rua_noturna_asfalto_molhado",
    "nome": "Rua Noturna – Asfalto Molhado com Neon",
    "categoria": "Urbano",
    "descricao": "Rua estreita, com asfalto molhado refletindo letreiros neon. Fachadas desgastadas, fios aparentes, atmosfera pesada e brilho urbano característico.",
    "camadas": {
      "foreground": ["poças de água", "reflexos neon", "detritos urbanos"],
      "midground": ["paredes grafitadas", "portas metálicas", "postes de luz"],
      "background": ["letreiros neon distantes", "silhuetas de prédios", "haze azul"]
    },
    "iluminacao_motivada": {
      "key": "luz fria de poste",
      "rim": "contraluz de neon",
      "fill": "reflexo do asfalto",
      "practicals": ["letreiros", "faróis de carro"]
    },
    "texturas_dominantes": [
      "urban_asphalt_wet_neon",
      "neon_reflection_surface",
      "parede_descascada",
      "fios_urbanos"
    ],
    "atmosfera": {
      "haze": "fino",
      "vapor": "moderado",
      "particulas": "baixas"
    },
    "comportamento_camera": {
      "melhor_combinacao": [
        "orbit_slow_20",
        "track_lateral_suave",
        "dolly_in_lento"
      ],
      "movimentos_proibidos": [
        "crane_fake_rapido",
        "movimentos_perfeitos_sem_jitter"
      ]
    },
    "regras_continuidade": {
      "temperatura": "fria",
      "luminosidade": "baixa",
      "contraste": "alto",
      "humidade": "alta"
    }
  },
  {
    "id": "estudio_branco_infinito",
    "nome": "Estúdio Branco Infinito (Ciclorama)",
    "categoria": "Moda",
    "descricao": "Um estúdio com ciclorama branco, criando um fundo infinito e sem sombras duras. A iluminação é perfeitamente controlada e difusa.",
    "camadas": {
      "foreground": ["sujeito"],
      "midground": ["chão branco liso"],
      "background": ["fundo branco infinito"]
    },
    "iluminacao_motivada": {
      "key": "grande softbox frontal (key_soft_beauty)",
      "rim": "backlight suave para recorte",
      "fill": "luz rebatida das paredes brancas",
      "practicals": []
    },
    "texturas_dominantes": [
      "superficies_perfeitas_lisas",
      "skin_microdetail_pores_01",
      "tecido_com_textura_visivel"
    ],
    "atmosfera": {
      "haze": "nenhum",
      "vapor": "nenhum",
      "particulas": "nenhuma"
    },
    "comportamento_camera": {
      "melhor_combinacao": [
        "dolly_in_slow",
        "track_lateral_suave",
        "câmera estática"
      ],
      "movimentos_proibidos": [
        "handheld_tremido",
        "movimentos_bruscos"
      ]
    },
    "regras_continuidade": {
      "temperatura": "neutra",
      "luminosidade": "alta",
      "contraste": "baixo",
      "humidade": "baixa"
    }
  },
  {
    "id": "galpao_industrial_abandonado",
    "nome": "Galpão Industrial Abandonado",
    "categoria": "Industrial",
    "descricao": "Galpão amplo e vazio com paredes de concreto cru, poeira suspensa no ar e feixes de luz cortando a escuridão através de janelas quebradas.",
    "camadas": {
      "foreground": ["poeira no chão", "detritos"],
      "midground": ["colunas de concreto", "correntes penduradas"],
      "background": ["janelas altas com luz estourada", "paredes distantes em sombra"]
    },
    "iluminacao_motivada": {
      "key": "feixe de luz dura da janela",
      "rim": "luz rebatida do ambiente",
      "fill": "preenchimento negativo (sombras profundas)",
      "practicals": ["lâmpadas de serviço penduradas (opcional)"]
    },
    "texturas_dominantes": [
      "concreto_cru",
      "metal_enferrujado",
      "atmos_haze_cinematic_fine",
      "vidro_quebrado"
    ],
    "atmosfera": {
      "haze": "médio",
      "vapor": "baixo",
      "particulas": "altas"
    },
    "comportamento_camera": {
      "melhor_combinacao": [
        "dolly_in_lento",
        "handheld_estabilizado",
        "crane_down_lento"
      ],
      "movimentos_proibidos": [
        "zoom_digital",
        "movimentos_rapidos_e_bruscos"
      ]
    },
    "regras_continuidade": {
      "temperatura": "fria",
      "luminosidade": "baixa",
      "contraste": "alto",
      "humidade": "média"
    }
  }
];
