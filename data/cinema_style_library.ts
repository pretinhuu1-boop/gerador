// data/cinema_style_library.ts

export const ammarStylePreset = {
  "id": "editorial_ammar_clean",
  "nome": "Editorial Clean – Ammar Style",
  "categoria": "Moda",
  "logline": "Retratos editoriais minimalistas em ambientes controlados com contraste alto, direção precisa de luz e narrativa silenciosa de poder e contemplação.",

  "camera_profile": {
    "lentes_principais": ["35mm", "50mm"],
    "lentes_secundarias": ["24mm", "85mm"],
    "planos_dominantes": ["plano_medio", "plano_americano", "close_up"],
    "movimentos_base": [
      "dolly_in_slow",
      "dolly_out_slow",
      "orbit_soft_20",
      "track_lateral_suave",
      "micro_pedestal_up_down"
    ],
    "estabilidade": "gimbal_ou_tripé_com_micro_jitter_controlado",
    "framing_padrao": "sujeito_central_ou_em_tercos_com_linhas_de_arquitetura_guia"
  },

  "lighting_profile": {
    "tipo_geral": "soft_com_recorte_claro",
    "fontes_tipicas": [
      "janela_com_difusor",
      "softbox_retangular",
      "painel_led_com_grid"
    ],
    "direcoes_comuns": [
      "luz_lateral",
      "3_4_frontal",
      "backlight_fraco_para_recorte_de_cabelo"
    ],
    "relação_luz_sombra": "contraste_alto_mas_com_detalhe_em_sombra",
    "temperatura_cor": "mistura_de_neutro_com_toques_quentes_ou_frios_pontuais",
    "efeitos_especiais": [
      "highlight_na_pele",
      "specular_sutil_em_metais",
      "flare_controlado_ocasional"
    ]
  },

  "color_profile": {
    "paleta_base": [
      "tons_neutros_de_pele",
      "preto",
      "cinza_concreto",
      "off_white",
      "toques_de_azul_petróleo_ou_laranja_queimado"
    ],
    "saturacao": "baixa_a_media",
    "contraste_global": "alto",
    "tratamento_cor": "limpo_profissional_sem_tons_cartoon",
    "tendencias": [
      "pele_fiel",
      "pretos_com_detalhe",
      "altas_luzes_controladas_sem_estouro"
    ]
  },

  "texture_profile": {
    "pele": "poros, leve_oleosidade_natural_nariz_testa_bochecha_sem_plastificar",
    "roupa": "fibras_visiveis_dobras_naturais_nada_borrao",
    "ambiente": "paredes_de_concreto_liso_ou_textura_sutil_sem_poluição_visual",
    "atmosfera": "quase_sem_haze_apenas_um_sopro_para_dar_profundidade",
    "imagem": "grain_fino_35mm_ou_digital_film_like"
  },

  "environment_profile": {
    "locacoes_tipicas": [
      "corredor_minimalista",
      "sala_de_estudio_com_parede_lisa",
      "garagem_limpa_concreto",
      "rua_com_fundo_limpo"
    ],
    "profundidade": "2_a_3_camadas_de_plano_bem_definidas",
    "objetos_recorrentes": [
      "portas_simples",
      "corrimaos",
      "paredes_de_concreto",
      "vãos_de_escada"
    ],
    "densidade_cenario": "baixa_elementos_poucos_e_bem_posicionados"
  },

  "acting_blocking_profile": {
    "corpo": "ombros_relaxados_torax_aberto_postura_segura",
    "movimentos": "ajuste_de_jaqueta_mão_no_bolso_giro_lento_de_cabeca_mudancas_de_peso",
    "olhar": "alternar_entre_encarar_lente_olhar_fora_do_quadro_olhar_para_baixo_introspectivo",
    "energia": "energia_silenciosa_de_modelo_seguro_de_si",
    "expressao": "quase_neutra_com_micro_variações_de_lábio_olhos"
  },

  "composition_rules": {
    "dominancia": ["center_power", "rule_of_thirds_vertical"],
    "linhas_de_fuga": "usar_corredores_paredes_e_bordas_para_puxar_olho_para_o_modelo",
    "negativo": "deixar_bastante_espaco_vazio_intencional_para_respirar",
    "profundidade_campo": "shallow_moderado_fundo_sugerido_não_descritivo"
  },

  "continuity_rules": {
    "lente_constante_por_cena": true,
    "paleta_cor_constante": true,
    "intensidade_luz_variando_pouco": true,
    "movimento_camera": "em_arco_ou_reto_sem_trepidações",
    "ator": "continuidade_de_postura_e_micromovimentos_coerentes"
  },

  "editing_rhythm_profile": {
    "tempo_cena_8s": "sensacao_de_paixão_controlada_tempo_suspenso",
    "pontos_chave": [
      "0-2s_estabelecer_pose_e_olhar",
      "2-5s_micro_movimento_ou_ajuste_de_roupa",
      "5-8s_giro_sutil_ou_ligacao_com_a_camara"
    ],
    "uso_de_cortes": "poucos_cortes_preferencia_por_movimento_continuo"
  },

  "sib_tokens": {
    "palavras_que_apontam_para_esse_estilo": [
      "ammar",
      "editorial clean",
      "foto de moda minimalista",
      "estilo editorial de instagram premium",
      "lookbook clean",
      "retrato editorial urbano clean"
    ],
    "categorias": ["Moda", "Videoclipe", "Branding_luxo"]
  },

  "decoupage_defaults": {
    "frame_1_papel": "estabelecer_pose_base_ambiente_e_leitura_de_luz",
    "frame_2_papel": "refinar_expressao_ajuste_de_roupa_ou_micro_mudanca_de_angulo",
    "frame_3_papel": "mudar_vetor_de_olhar_ou_giro_leve_gerando_saida_da_cena",
    "camera_pattern": "dolly_in_slow_ou_orbit_soft_20_graus",
    "ator_pattern": "andar_poucos_passos_ou_so_micromovimentos_sem_trocar_de_marco"
  },

  "video_engine_modulation": {
    "movimento_camera_curva": "ease_in_out_suave",
    "velocidade": "baixa",
    "jitter": "quase_zero",
    "ênfase": "tempo_suficiente_para_ver_texturas_de_pele_e_roupa",
    "transicao_entre_frames": "transicao_por_movimento_continuo_nao_por_corte_duro"
  }
};

export const trapGritUrbanoPreset = {
  "id": "trap_contemporaneo_grit",
  "nome": "Trap Contemporâneo – Grit Urbano",
  "categoria": "Videoclipe",
  "logline": "Estética de trap agressivo com câmera viva, neon urbano, textura suja e narrativa de poder e caos controlado.",

  "camera_profile": {
    "lentes_principais": ["24mm", "35mm"],
    "lentes_secundarias": ["16mm", "50mm"],
    "planos_dominantes": [
      "plano_americano",
      "plano_medio",
      "close_up_agressivo"
    ],
    "movimentos_base": [
      "handheld_energetico",
      "track_lateral_rapido",
      "dolly_in_agressivo",
      "whip_pan_controlado",
      "push_in_no_pico_da_batida"
    ],
    "estabilidade": "handheld_com_jitter_intencional",
    "framing_padrao": "sujeito_às_vezes_descentralizado_em_composicoes_dinâmicas"
  },

  "lighting_profile": {
    "tipo_geral": "contraste_alto_com_áreas_de_escuridão_pesada",
    "fontes_tipicas": ["neon", "luz_de_rua", "spill_de_carro", "flash_estroboscopico_sutil"],
    "direcoes_comuns": ["luz_vindo_de_cima", "backlight_forte", "luz_de_lateral_dura"],
    "relação_luz_sombra": "zonas_de_preto_puro_com_highlights_intensos",
    "temperatura_cor": "mistura_frio_neon_com_toques_quentes",
    "efeitos_especiais": ["fumaça", "haze_pesado", "flares_de_neon"]
  },

  "color_profile": {
    "paleta_base": [
      "ciano_neon",
      "magenta_neon",
      "amarelo_sujo",
      "pretos_fortes",
      "skin_tone_puxado_para_frio_ou_verde_sutil_em_momentos"
    ],
    "saturacao": "alta_nos_neons_media_na_pele",
    "contraste_global": "muito_alto",
    "tratamento_cor": "gritty_com_clipping_controlado_em_highlights",
    "tendencias": [
      "halation_em_luzes_fortes",
      "glow_em_neons",
      "pretos_pesados_sem_apagar_totalmente_detalhe"
    ]
  },

  "texture_profile": {
    "pele": "detalhada_com_suor_e_reflexo_urbano",
    "roupa": "nylon_couro_denim_com_reflexo_é_tattoos_visiveis",
    "ambiente": "paredes_descascadas_pisos_sujos_lixo_visivel",
    "atmosfera": "haze_visivel_fumaca_de_cigarro_ou_narguile",
    "imagem": "grain_medio_com_ar_de_digital_sujo"
  },

  "environment_profile": {
    "locacoes_tipicas": [
      "beco_neon",
      "garagem_subterranea",
      "telhado_de_predio_com_cidade_ao_fundo",
      "interior_de_carro_com_luz_de_rua"
    ],
    "profundidade": "plano_de_fundo_cheio_de_informacao_luminosa_e_texturas",
    "objetos_recorrentes": [
      "carros_baixos",
      "grades",
      "muros_pixados",
      "fumaça_de_bueiro"
    ],
    "densidade_cenario": "alta_mas_controlada_para_nao_virar_caos_total"
  },

  "acting_blocking_profile": {
    "corpo": "postura_relaxada_mas_pronta_para_explodir_confiança_e_arrogância",
    "movimentos": "gestos_marcados_no_beat_mão_no_peito_apontando_para_camera_maneios_de_cabeca",
    "olhar": "muito_contato_com_a_lente_olhar_de_desprezo_ou_superioridade",
    "energia": " média_a_alta",
    "expressao": "mistura_de_frio_com_soberba_e_às_vezes_sorriso_irônico"
  },

  "composition_rules": {
    "dominancia": ["rule_of_thirds_dinâmico", "center_power_para_momentos_chave"],
    "linhas_de_fuga": "usar_rua_cabos_de_luz_prédios_como_guia_de_profundidade",
    "negativo": "pouco_espaco_negativo_normalmente_tudo_muito_preenchido",
    "profundidade_campo": "média_pro_fundo_ainda_ser_legivel"
  },

  "continuity_rules": {
    "lente_constante_por_cena": false,
    "paleta_cor_constante": true,
    "intensidade_luz_variando_conforme_batida": true,
    "movimento_camera": "sempre_vivo_nunca_totalmente_parado",
    "ator": "deve_estar_semper_no_ritmo_da_musica"
  },

  "editing_rhythm_profile": {
    "tempo_cena_8s": "sensacao_de_energia_em_constante_construcao",
    "pontos_chave": [
      "0-2s_estabelecimento_de_ambiente_e_postura",
      "2-5s_interacao_forte_com_camera_ou_elementos",
      "5-8s_pico_de_atitude_movimento_mais_ousado"
    ],
    "uso_de_cortes": "frequente_sempre_podendo_cortar_no_beat"
  },

  "sib_tokens": {
    "palavras_que_apontam_para_esse_estilo": [
      "trap gringo",
      "clip de trap moderno",
      "grit urbano",
      "estética de rua pesada",
      "neon sujo",
      "clipe de trap atual"
    ],
    "categorias": ["Videoclipe", "Cinema_urbano"]
  },

  "decoupage_defaults": {
    "frame_1_papel": "mostrar_artista_e_ambiente_ao_mesmo_tempo",
    "frame_2_papel": "explodir_em_atitude_gesto_e_interacao",
    "frame_3_papel": "encerrar_com_giro_ou_afastamento_com_sombra_ou_heading_para_fora",
    "camera_pattern": "handheld_dolly_in_no_beat_orbit_curta",
    "ator_pattern": "gestos_na_batida_olhar_duro_pra_lente"
  },

  "video_engine_modulation": {
    "movimento_camera_curva": "mais_agressiva_e_angular",
    "velocidade": "media_para_alta",
    "jitter": "visível_porem_controlado",
    "ênfase": "drama_de_luz_neon_e_sujeira_urbana",
    "transicao_entre_frames": "pode_ter_mini_whip_pan_ou_micro_jump_cut_suave"
  }
};

export const funkPeriferiaSpRawPreset = {
  "id": "funk_periferia_sp_raw",
  "nome": "Funk Periferia SP – Raw Real",
  "categoria": "Videoclipe",
  "logline": "Estética crua da quebrada, luz de rua, textura dura, espontaneidade real, câmera perto da pele e da moto.",

  "camera_profile": {
    "lentes_principais": ["24mm", "35mm"],
    "lentes_secundarias": ["16mm"],
    "planos_dominantes": [
      "plano_conjunto_rua",
      "plano_americano",
      "close_up_rapido"
    ],
    "movimentos_base": [
      "handheld_de_rua",
      "follow_cam_correndo",
      "low_angle_tracking_proximo_do_asfalto",
      "câmera_na_mão_subindo_e_descendo_no_beat"
    ],
    "estabilidade": "instável_controlado_com_sensacao_documental",
    "framing_padrao": "freq_baixo_próximo_do_chao_ou_muito_perto_da_face"
  },

  "lighting_profile": {
    "tipo_geral": "luz_mista_real",
    "fontes_tipicas": [
      "poste_de_luz_amarela",
      "fachada_de_bar",
      "farol_de_moto_e_carro",
      "flash_estourado_de_celular"
    ],
    "direcoes_comuns": ["luz_vindo_de_cima_e_da_frente", "backlight_de_carro"],
    "relação_luz_sombra": "zonas_muito_escura_com_luz_dura_estourada_em_pontos",
    "temperatura_cor": "tende_para_quente_sujo_amarelado",
    "efeitos_especiais": ["flare_de_farol", "reflexo_no_asfalto", "fumaça_de_churrasco_ou_moto"]
  },

  "color_profile": {
    "paleta_base": [
      "sódio_amarelado",
      "tons_de_pele_mais_quentes",
      "vermelho_de_placa_ou_neon",
      "preto_roupa_e_asfalto",
      "verdes_de_letreiros"
    ],
    "saturacao": "media_alta_no_ambiente_media_na_pele",
    "contraste_global": "alto_com_clipping_em_luzes",
    "tratamento_cor": "quase_documental_com_um_toque_de_clipe",
    "tendencias": [
      "pele_com_sombra_dura",
      "pretos_muito_pesados",
      "estouros_em_luz_de_poste"
    ]
  },

  "texture_profile": {
    "pele": "suor_reflexo_rua_marcas_de_pele_nítidas",
    "roupa": "tecidos_sinteticos_funk_casacos_de_time_camiseta_e_correntes",
    "ambiente": "asfalto_rugoso_muro_pixado_lojas_simples",
    "atmosfera": "pouca_haze_mas_muito_ruido_ambiental_real",
    "imagem": "grain_medio_a_alto_com_sensacao_de_camera_de_mao_real"
  },

  "environment_profile": {
    "locacoes_tipicas": [
      "rua_de_baile",
      "quadra",
      "frente_de_bar",
      "beco_com_motos"
    ],
    "profundidade": "multiplas_pessoas_fundo_com_movimento_constante",
    "objetos_recorrentes": [
      "motos",
      "caixa_de_som",
      "geladeira_de_bebida",
      "muros",
      "poste"
    ],
    "densidade_cenario": "alta_varios_elementos_preenchendo_o_quadro"
  },

  "acting_blocking_profile": {
    "corpo": "postura_relaxada_com_quebrada_natural_de_quem_ja_é_do_lugar",
    "movimentos": "passinhos_de_funk_gestos_de_mao_grau_de_moto_rebolado_do_elenco",
    "olhar": "mistura_de_brincadeira_com_seriedade_quando_encara_a_lente",
    "energia": "alta",
    "expressao": "sorriso_frequente_mas_tambem_olhar_duro_em_alguns_momentos"
  },

  "composition_rules": {
    "dominancia": ["close_na_ação", "wide_para_ver_a_que-brada"],
    "linhas_de_fuga": "rua_e_calçada_funcionam_com_linhas_guide_de_profundidade",
    "negativo": "quase_nulo_quadro_é_sempre_farto_de_informação",
    "profundidade_campo": "mais_fechado_no_sujeito_mas_sem_apagar_totalmente_fundo"
  },

  "continuity_rules": {
    "lente_constante_por_cena": false,
    "paleta_cor_constante": true,
    "intensidade_luz_variando_conforme_ambiente": true,
    "movimento_camera": "sempre_vivo_com_impulso_de_documentario",
    "ator": "se_mantem_na_vibe_funk_nao_fica_statico"
  },

  "editing_rhythm_profile": {
    "tempo_cena_8s": "sensacao_de_baile_em_andamento",
    "pontos_chave": [
      "0-2s_mostrar_o_contexto_rua_baile_pessoas",
      "2-5s_foco_no_artista_ou_na_acao_central(moto, danca)",
      "5-8s_interacao_entre_artista_e_rua_giro_de_camera_ou_saida"
    ],
    "uso_de_cortes": "cortes_no_beat_e_jump_cuts_podem_ser_bem_vindos"
  },

  "sib_tokens": {
    "palavras_que_apontam_para_esse_estilo": [
      "funk de quebrada",
      "vídeo de baile funk rua",
      "estética funk SP real",
      "clipe na comunidade",
      "moto e grau funk"
    ],
    "categorias": ["Videoclipe", "Cinema_urbano_documental"]
  },

  "decoupage_defaults": {
    "frame_1_papel": "estabelecer_rua_gente_e_energia",
    "frame_2_papel": "foco_na_acao_clave(danca_moto_artista)",
    "frame_3_papel": "movimento_de_saida_ou_interacao_final_com_camera",
    "camera_pattern": "handheld_baixo_proximo_do_asfalto_e_dos_corpos",
    "ator_pattern": "sempre_em_movimento_coreografado_ou_spontaneo"
  },

  "video_engine_modulation": {
    "movimento_camera_curva": "nervosa_mas_controlada",
    "velocidade": "media_para_alta_no_pico_da_musica",
    "jitter": "presente",
    "ênfase": "sensacao_de_estarmos_no_meio_da_rua_com_eles",
    "transicao_entre_frames": "pode_ser_feita_por_camera_passando_atras_de_objeto_ou_por_corte_bruto"
  }
};
