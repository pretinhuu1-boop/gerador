// data/narrative_library.ts

export interface VisualNarrativePreset {
  id: string;
  tema_central: string;
  subtema: string;
  emocao_primaria: string;
  emocao_secundaria: string;
  ritmo: string;
  estetica: string;
  acao_narrativa: {
    inicio: string;
    meio: string;
    climax: string;
  };
  simbolos_visuais: string[];
  metafora: string;
  comportamento_camera: string[];
  continuidade_entre_frames: {
    frame_1: string;
    frame_2: string;
    frame_3: string;
  };
}

export const narrativeLibrary: VisualNarrativePreset[] = [
  {
    "id": "ascensao_urbana_introspectiva",
    "tema_central": "ascensao",
    "subtema": "introspeccao_no_ambiente_urbano",
    "emocao_primaria": "determinação silenciosa",
    "emocao_secundaria": "foco e isolamento emocional",
    "ritmo": "lento-intenso",
    "estetica": "urbano_gritty_moderno",
    "acao_narrativa": {
      "inicio": "personagem analisa o ambiente",
      "meio": "movimento sutil de avanço",
      "climax": "olhar direto que domina a câmera"
    },
    "simbolos_visuais": [
      "linhas ascendentes",
      "contraluz azul",
      "distância emocional",
      "rua molhada"
    ],
    "metafora": "crescer mesmo cercado de caos",
    "comportamento_camera": [
      "dolly_in_slow",
      "micro_orbit",
      "tilt_up_sutil"
    ],
    "continuidade_entre_frames": {
      "frame_1": "estabelece ambiente e distância emocional",
      "frame_2": "reduz distância e intensifica foco",
      "frame_3": "olhar e presença tomam controle"
    }
  },
  {
    "id": "o_olhar_que_entra_na_alma",
    "tema_central": "revelacao",
    "subtema": "conexao_emocional_intima",
    "emocao_primaria": "vulnerabilidade",
    "emocao_secundaria": "verdade",
    "ritmo": "muito lento",
    "estetica": "cinematografico_intimista",
    "acao_narrativa": {
      "inicio": "olhar distante ou para baixo",
      "meio": "rosto se vira lentamente para a câmera",
      "climax": "olhar direto, penetrante e sustentado na lente"
    },
    "simbolos_visuais": ["foco raso", "luz suave", "pele real", "olhos lacrimejantes (opcional)"],
    "metafora": "a alma se revelando sem barreiras",
    "comportamento_camera": ["dolly_in_lento", "câmera estática"],
    "continuidade_entre_frames": {
      "frame_1": "estabelece a introspecção com um plano médio",
      "frame_2": "aproxima para um close-up, capturando a mudança na expressão",
      "frame_3": "close extremo nos olhos, conexão total com a câmera"
    }
  },
  {
    "id": "a_caminhada_do_heroi_urbano",
    "tema_central": "conquista",
    "subtema": "jornada_solitaria_em_ambiente_hostil",
    "emocao_primaria": "determinacao",
    "emocao_secundaria": "resiliencia",
    "ritmo": "lento e constante",
    "estetica": "urbano_gritty_moderno",
    "acao_narrativa": {
      "inicio": "personagem caminha em ambiente amplo e desafiador",
      "meio": "enfrenta um obstáculo visual (vapor, multidão, escuridão)",
      "climax": "emerge do obstáculo, mais forte e com o olhar focado no destino"
    },
    "simbolos_visuais": ["caminhada constante", "ambiente adverso", "luz no fim do túnel"],
    "metafora": "a jornada é difícil, mas o destino é certo",
    "comportamento_camera": ["tracking_shot_lateral", "dolly_in_lento"],
    "continuidade_entre_frames": {
      "frame_1": "plano aberto, mostrando o personagem pequeno no ambiente",
      "frame_2": "plano médio, personagem no meio do obstáculo",
      "frame_3": "plano americano, personagem emergindo com postura de conquista"
    }
  },
  {
    "id": "seducao_estetica_misteriosa",
    "tema_central": "seducao",
    "subtema": "mistério_e_charme_na_escuridao",
    "emocao_primaria": "confiança magnética",
    "emocao_secundaria": "mistério",
    "ritmo": "lento e sinuoso",
    "estetica": "noir_moderno",
    "acao_narrativa": {
      "inicio": "personagem emerge das sombras",
      "meio": "um gesto sutil e calculado (ajustar roupa, tocar o lábio)",
      "climax": "um olhar de lado, um sorriso quase imperceptível"
    },
    "simbolos_visuais": ["sombras profundas", "luz de recorte", "fumaça", "reflexos"],
    "metafora": "o que não se vê é mais poderoso do que o que se mostra",
    "comportamento_camera": ["orbit_soft_20", "câmera estática com foco seletivo"],
    "continuidade_entre_frames": {
      "frame_1": "silhueta ou parte do corpo revelada pela luz de recorte",
      "frame_2": "plano médio, revelando o rosto e o gesto",
      "frame_3": "close-up no olhar ou no detalhe do gesto"
    }
  }
];
