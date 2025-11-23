// data/texture_library.ts

export interface TexturePreset {
  id: string;
  nome: string;
  categoria: 'Física' | 'Ambiental' | 'Atmosférica' | 'Ótica' | 'Dinâmica';
  descricao: string;
  parametros_tecnicos: {
    roughness: string;
    specular: string;
    micro_bump_strength: string;
    subsurface_scattering?: 'leve' | 'médio' | 'forte';
    anisotropy?: string;
    reflectance?: string;
  };
  efeito_visual: string[];
  usos: string[];
  restricoes?: string[];
  combinacoes_recomendadas?: string[];
  comportamento_video_engine?: {
    motion_blur_retain_detail?: boolean;
    grain_amount?: string;
    sharpness?: 'leve' | 'médio' | 'forte';
  };
}

export const textureLibrary: TexturePreset[] = [
  // Skin Textures
  {
    id: "skin_microdetail_pores_01",
    nome: "Pele – Microdetalhe: Poros Reais",
    categoria: "Física",
    descricao: "Representação realista de micro poros, oleosidade natural suave, micro penugem, variações tonais e irregularidades naturais da pele humana sob luz difusa editorial.",
    parametros_tecnicos: {
      roughness: "0.35",
      specular: "0.12",
      micro_bump_strength: "0.08",
      subsurface_scattering: "leve",
      anisotropy: "0.10",
      reflectance: "baixo"
    },
    efeito_visual: ["hiper-realismo", "proximidade emocional", "clareza de profundidade"],
    usos: ["close-up editorial", "cenas de moda", "frames com 35mm ou 85mm"],
    restricoes: ["não usar em distância > 3m", "não aplicar com luz dura extrema"],
    combinacoes_recomendadas: ["grain_35mm_soft", "rim_light_soft_blue"],
    comportamento_video_engine: {
      motion_blur_retain_detail: true,
      grain_amount: "0.12",
      sharpness: "leve"
    }
  },
  {
    id: "skin_black_warm_luminosity",
    nome: "Pele Negra – Luminosidade Quente",
    categoria: "Física",
    descricao: "Textura para pele negra que realça os subtons quentes, controla os highlights para evitar estouro e cria volume com luz suave.",
    parametros_tecnicos: {
        roughness: "0.40",
        specular: "0.20",
        micro_bump_strength: "0.07",
        subsurface_scattering: "médio",
    },
    efeito_visual: ["volume", "tons de pele ricos", "controle de highlight"],
    usos: ["pele negra", "retrato", "luz quente"]
  },
  // Fabric Textures
  {
    id: "fabric_denim_14oz",
    nome: "Tecido – Jeans 14oz Enrijecido",
    categoria: "Física",
    descricao: "Textura de jeans grosso e pesado (14oz), com trama diagonal visível, vincos marcados e leve desbotamento natural.",
     parametros_tecnicos: {
      roughness: "0.85",
      specular: "0.05",
      micro_bump_strength: "0.40",
    },
    efeito_visual: ["realismo tátil", "look urbano", "peso no vestuário"],
    usos: ["trap", "funk", "moda de rua", "editorial urbano"],
  },
  // Urban Materials
  {
    id: "urban_asphalt_wet_neon",
    nome: "Ambiente – Asfalto Molhado com Reflexo Neon",
    categoria: "Ambiental",
    descricao: "Superfície de asfalto escuro e irregular, coberta por uma fina camada de água que reflete intensamente as luzes de neon do ambiente.",
    parametros_tecnicos: {
      roughness: "0.15",
      specular: "0.80",
      micro_bump_strength: "0.25",
    },
    efeito_visual: ["profundidade", "atmosfera noturna", "look cyberpunk/trap"],
    usos: ["cenas noturnas", "rua", "trap", "noir"],
    combinacoes_recomendadas: ["practical_neon_sign", "rim_aggressive_purple"]
  },
  // Atmospheric Textures
  {
    id: "atmos_haze_cinematic_fine",
    nome: "Atmosfera – Haze Fino Cinematográfico",
    categoria: "Atmosférica",
    descricao: "Partículas finas de névoa (haze) suspensas no ar, que tornam os feixes de luz visíveis, adicionam profundidade e suavizam o contraste.",
    parametros_tecnicos: {
      roughness: "N/A",
      specular: "N/A",
      micro_bump_strength: "N/A",
    },
    efeito_visual: ["profundidade", "feixes de luz (god rays)", "look cinematográfico"],
    usos: ["drama", "show", "thriller", "quase todas as cenas cinematográficas"]
  },
  // Optical Textures
  {
    id: "optic_grain_35mm",
    nome: "Ótica – Granulação de Filme 35mm",
    categoria: "Ótica",
    descricao: "Simulação de granulação de película de filme 35mm, adicionando textura orgânica à imagem. Evita o look 'clínico' do digital.",
    parametros_tecnicos: {
      roughness: "N/A",
      specular: "N/A",
      micro_bump_strength: "N/A",
    },
    efeito_visual: ["textura orgânica", "look de cinema", "nostalgia"],
    usos: ["drama", "trap", "noir", "estilo vintage"]
  }
];
