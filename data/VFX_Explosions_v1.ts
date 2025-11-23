// data/VFX_Explosions_v1.ts

export const VFX_SUPERVISOR_SYSTEM_PROMPT = `Você é um VFX Supervisor especializado em simulações físicas realistas de explosões, partículas, fumaça e danos ambientais para vídeos gerados por IA (como Veo 3.1 e modelos similares).

Sua função é:
1. Interpretar a cena, ambiente e contexto narrativo.
2. Traduzir essa cena em um conjunto de parâmetros físicos e cinematográficos em JSON.
3. Gerar um prompt cinematográfico em INGLÊS que o modelo de vídeo irá entender.
4. Sempre respeitar a física: explosões não são gifs, são fenômenos com fases, forças, partículas e interação com o ambiente.

SEMPRE modele explosões em CINCO FASES:
- A) ignition_flash: clarão inicial de detonação
- B) shockwave: onda de pressão e distorção do ar
- C) fireball: bola de fogo e expansão térmica
- D) debris: fragmentos, faíscas, lixo, estilhaços
- E) dissipation: fumaça, poeira, haze e calor dissipando

REGRAS GERAIS:
- Sempre descreva a interação com o ambiente (luz batendo nas superfícies, poeira levantando do chão, sombras mudando).
- Sempre descreva a reação do personagem (roupas vibrando, cabelo mexendo, expressão corporal).
- Sempre especifique a posição da câmera, tipo de lente e movimento.
- Use negative prompts para evitar deformações, flicker, glitches e mudanças bruscas não físicas.
- Os prompts cinematográficos devem ser em INGLÊS, descritivos, focados em CINEMA e FÍSICA.
- O JSON de saída SEMPRE deve seguir o SCHEMA definido pelo módulo abaixo.

SAÍDA ESPERADA:
Você sempre retorna UM ÚNICO OBJETO JSON com esta estrutura:

{
  "scene_meta": { ... },
  "camera": { ... },
  "vfx_config": { ... },
  "cinematic_prompt_en": "..."
}

Onde:
- "scene_meta" resume a situação.
- "camera" define como o mundo é visto.
- "vfx_config" define as propriedades físicas da explosão e partículas.
- "cinematic_prompt_en" é o texto final para o modelo de vídeo.

Sempre que o usuário escolher um preset da biblioteca (por ID), você deve:
1. Carregar o preset.
2. Adaptar a descrição da cena e câmera ao contexto específico.
3. Ajustar apenas o necessário (ex: intensidade, distância, escala de ambiente).
4. Nunca perder as cinco fases físicas da explosão.
`;

export const VFX_EXPLOSION_PRESETS = [
    {
        "scene_meta": {
          "preset_id": "street_micro_blast",
          "title": "Pequena explosão em rua urbana",
          "location_type": "urban_street",
          "time_of_day": "night",
          "weather": "clear",
          "description_pt": "Explosão pequena saindo de trás de um carro estacionado em rua de periferia, com postes de luz e prédios baixos."
        },
        "camera": {
          "framing": "medium",
          "angle": "low",
          "movement": "handheld",
          "lens_mm": 35,
          "depth_of_field": "shallow",
          "handheld_micro_jitter": true
        },
        "vfx_config": {
          "scale": "small",
          "distance_from_camera_m": 20,
          "phases": {
            "ignition_flash": {
              "start_sec": 0.0,
              "end_sec": 0.12,
              "light_intensity": 0.8,
              "color_profile": "white_hot",
              "description": "clarão curto atrás do carro, iluminando as bordas do veículo"
            },
            "shockwave": {
              "start_sec": 0.12,
              "end_sec": 0.4,
              "air_distortion_intensity": 0.5,
              "dust_lift_amount": 0.4,
              "cloth_reaction": 0.5,
              "description": "onda de choque moderada, poeira leve do asfalto"
            },
            "fireball": {
              "start_sec": 0.4,
              "end_sec": 1.1,
              "flame_layers": ["white_core", "yellow", "orange"],
              "turbulence": 0.6,
              "brightness": 0.8,
              "description": "bola de fogo pequena, mais horizontal que vertical"
            },
            "debris": {
              "start_sec": 0.35,
              "end_sec": 1.8,
              "particle_density": "low",
              "particle_types": ["ash", "small_metal", "sparks"],
              "gravity_strength": 1.0,
              "air_drag": 0.5,
              "directional_force": "outward_from_center",
              "description": "fragmentos pequenos, faíscas curtas e cinzas flutuando"
            },
            "dissipation": {
              "start_sec": 1.1,
              "end_sec": 4.0,
              "smoke_density": "low",
              "smoke_color": "dark_gray",
              "ground_haze": 0.4,
              "heat_ripple_intensity": 0.3,
              "description": "fumaça fina subindo atrás do carro, leve haze na rua"
            }
          },
          "forces": {
            "gravity_strength": 1.0,
            "air_drag": 0.5,
            "turbulence": 0.6,
            "updraft": 0.3
          },
          "damage_response": {
            "environment": {
              "glass_break": false,
              "nearby_fixtures_shake": true,
              "dust_from_walls": false
            },
            "character_reaction": {
              "cloth_flap_intensity": 0.4,
              "hair_movement": 0.3,
              "body_recoil": 0.2
            }
          }
        },
        "cinematic_prompt_en": "hyper realistic small explosion behind a parked car on a Brazilian urban street at night, initial white-hot flash briefly overexposing the rear of the vehicle, then a moderate shockwave distorting the air and lifting a thin layer of dust from the asphalt, clothes and hair of the subject in foreground reacting subtly to the pressure, a compact fireball forming with layered white-to-yellow-to-orange flames, low turbulence and limited height, small sparks and metal fragments flying outward and quickly falling under realistic gravity and air drag, light reflections dancing on nearby car surfaces and wet patches on the ground, thin smoke rising behind the car and a soft ground-level haze spreading out, low-angle 35mm handheld camera with micro jitter, shallow depth of field, cinematic HDR lighting, physically accurate interaction between light, dust and environment, negative prompt: no cartoon fire, no unrealistic slow motion, no character deformation, no random glitch, no flicker"
      },
      {
        "scene_meta": {
          "preset_id": "car_highway_blast",
          "title": "Carro explodindo em rodovia",
          "location_type": "highway",
          "time_of_day": "sunset",
          "weather": "clear",
          "description_pt": "Carro em rodovia deserta explode, com fogo alto e muitos destroços."
        },
        "camera": {
          "framing": "wide",
          "angle": "eye_level",
          "movement": "tracking",
          "lens_mm": 28,
          "depth_of_field": "medium",
          "handheld_micro_jitter": false
        },
        "vfx_config": {
          "scale": "large",
          "distance_from_camera_m": 35,
          "phases": {
            "ignition_flash": {
              "start_sec": 0.0,
              "end_sec": 0.18,
              "light_intensity": 1.0,
              "color_profile": "white_hot",
              "description": "clarão intenso iluminando o asfalto e guard-rails"
            },
            "shockwave": {
              "start_sec": 0.18,
              "end_sec": 0.6,
              "air_distortion_intensity": 0.9,
              "dust_lift_amount": 0.9,
              "cloth_reaction": 1.0,
              "description": "onda de choque forte, distorção visível no ar, poeira pesada"
            },
            "fireball": {
              "start_sec": 0.6,
              "end_sec": 2.0,
              "flame_layers": ["white_core", "yellow", "orange", "deep_red"],
              "turbulence": 1.0,
              "brightness": 1.0,
              "description": "bola de fogo alta, em forma de cogumelo, muito turbulenta"
            },
            "debris": {
              "start_sec": 0.45,
              "end_sec": 3.0,
              "particle_density": "high",
              "particle_types": ["metal_shards", "glass_fragments", "rubber_bits", "sparks"],
              "gravity_strength": 1.0,
              "air_drag": 0.5,
              "directional_force": "forward_and_up_from_car",
              "description": "destroços do carro voando, pedaços de metal e vidro, faíscas longas"
            },
            "dissipation": {
              "start_sec": 2.0,
              "end_sec": 6.0,
              "smoke_density": "high",
              "smoke_color": "black",
              "ground_haze": 0.9,
              "heat_ripple_intensity": 0.8,
              "description": "coluna de fumaça preta, haze denso ao nível do asfalto"
            }
          },
          "forces": {
            "gravity_strength": 1.0,
            "air_drag": 0.5,
            "turbulence": 0.9,
            "updraft": 0.7
          },
          "damage_response": {
            "environment": {
              "glass_break": true,
              "nearby_fixtures_shake": true,
              "dust_from_walls": false
            },
            "character_reaction": {
              "cloth_flap_intensity": 1.0,
              "hair_movement": 0.9,
              "body_recoil": 0.7
            }
          }
        },
        "cinematic_prompt_en": "hyper realistic car explosion on a deserted highway at sunset, intense white-hot ignition flash lighting up the asphalt and guard rails, a powerful shockwave expanding outward with visible air refraction and heavy dust lifting from the ground, the character in the foreground reacting with clothes whipping violently and hair pushed by the pressure, a tall mushroom-shaped fireball with layered white-yellow-orange-deep red flames and chaotic turbulence, large chunks of metal and glass bursting away from the car, long sparking trails following realistic gravity and air drag, black smoke forming a thick column while dense haze covers the highway at ground level, 28mm wide tracking camera moving slightly sideways, medium depth of field, cinematic HDR lighting, physically accurate interaction of light, debris, dust and smoke across the scene, negative prompt: no cartoon explosion, no unrealistic particle behavior, no deformed vehicles, no glitch, no jittering frames"
      },
      {
        "scene_meta": {
          "preset_id": "industrial_tank_blast",
          "title": "Explosão de tanque industrial",
          "location_type": "industrial",
          "time_of_day": "night",
          "weather": "overcast",
          "description_pt": "Tanque grande em área industrial explode, criando bola de fogo gigantesca e forte impacto visual."
        },
        "camera": {
          "framing": "wide",
          "angle": "high",
          "movement": "crane",
          "lens_mm": 24,
          "depth_of_field": "deep",
          "handheld_micro_jitter": false
        },
        "vfx_config": {
          "scale": "massive",
          "distance_from_camera_m": 80,
          "phases": {
            "ignition_flash": {
              "start_sec": 0.0,
              "end_sec": 0.2,
              "light_intensity": 1.0,
              "color_profile": "white_hot",
              "description": "clarão gigantesco iluminando toda a planta industrial"
            },
            "shockwave": {
              "start_sec": 0.2,
              "end_sec": 0.7,
              "air_distortion_intensity": 1.0,
              "dust_lift_amount": 1.0,
              "cloth_reaction": 1.0,
              "description": "onda de choque devastadora, distorcendo o ar e levantando poeira massiva"
            },
            "fireball": {
              "start_sec": 0.7,
              "end_sec": 3.5,
              "flame_layers": ["white_core", "yellow", "orange", "deep_red"],
              "turbulence": 1.0,
              "brightness": 1.0,
              "description": "bola de fogo colossal, subindo alto no céu com extrema turbulência"
            },
            "debris": {
              "start_sec": 0.5,
              "end_sec": 4.0,
              "particle_density": "very_high",
              "particle_types": ["metal_shards", "structure_pieces", "ash", "sparks"],
              "gravity_strength": 1.0,
              "air_drag": 0.6,
              "directional_force": "radial_outward",
              "description": "grandes pedaços de estrutura voando, cinzas e faíscas intensas"
            },
            "dissipation": {
              "start_sec": 3.5,
              "end_sec": 8.0,
              "smoke_density": "very_high",
              "smoke_color": "black",
              "ground_haze": 1.0,
              "heat_ripple_intensity": 1.0,
              "description": "enorme nuvem de fumaça preta, haze total cobrindo instalações"
            }
          },
          "forces": {
            "gravity_strength": 1.0,
            "air_drag": 0.6,
            "turbulence": 1.0,
            "updraft": 0.9
          },
          "damage_response": {
            "environment": {
              "glass_break": true,
              "nearby_fixtures_shake": true,
              "dust_from_walls": true
            },
            "character_reaction": {
              "cloth_flap_intensity": 1.0,
              "hair_movement": 1.0,
              "body_recoil": 0.9
            }
          }
        },
        "cinematic_prompt_en": "massive hyper realistic explosion of an industrial tank at night, gigantic white-hot ignition flash lighting the entire refinery complex, followed by a devastating shockwave that heavily distorts the air and lifts enormous amounts of dust and debris from the ground, structures vibrating and distant windows shattering, a colossal fireball rising into the sky with layered white-yellow-orange-deep red flames and extreme turbulence, huge pieces of metal and tank fragments thrown outward in realistic arcs, countless embers and ash swirling in the air under strong updraft and turbulence, ultra-dense black smoke forming an enormous cloud while thick haze blankets the whole facility, high-angle crane shot with a 24mm lens showing the scale of destruction, deep depth of field, cinematic HDR, physically accurate light scattering, shockwave behavior and particle dynamics, negative prompt: no cartoon fire, no unrealistic slow motion, no sci-fi plasma effects, no deformed buildings"
      },
      {
        "scene_meta": {
          "preset_id": "stage_pyro_hit",
          "title": "Explosão controlada de pirotecnia de palco",
          "location_type": "stage_show",
          "time_of_day": "night",
          "weather": "clear",
          "description_pt": "Jato de pirotecnia subindo em palco, explosão controlada, muita luz e faísca, pouco dano."
        },
        "camera": {
          "framing": "medium",
          "angle": "low",
          "movement": "handheld",
          "lens_mm": 35,
          "depth_of_field": "medium",
          "handheld_micro_jitter": true
        },
        "vfx_config": {
          "scale": "small",
          "distance_from_camera_m": 8,
          "phases": {
            "ignition_flash": {
              "start_sec": 0.0,
              "end_sec": 0.1,
              "light_intensity": 0.9,
              "color_profile": "warm_gold",
              "description": "clarão quente subindo do piso do palco"
            },
            "shockwave": {
              "start_sec": 0.1,
              "end_sec": 0.25,
              "air_distortion_intensity": 0.2,
              "dust_lift_amount": 0.1,
              "cloth_reaction": 0.3,
              "description": "leve pressão de ar, quase imperceptível"
            },
            "fireball": {
              "start_sec": 0.1,
              "end_sec": 0.8,
              "flame_layers": ["yellow", "orange"],
              "turbulence": 0.5,
              "brightness": 0.9,
              "description": "jato de chama vertical, alto brilho e movimento rápido"
            },
            "debris": {
              "start_sec": 0.1,
              "end_sec": 1.2,
              "particle_density": "medium",
              "particle_types": ["sparks"],
              "gravity_strength": 1.0,
              "air_drag": 0.6,
              "directional_force": "upward",
              "description": "faíscas douradas subindo e caindo em volta"
            },
            "dissipation": {
              "start_sec": 0.8,
              "end_sec": 2.0,
              "smoke_density": "low",
              "smoke_color": "light_gray",
              "ground_haze": 0.2,
              "heat_ripple_intensity": 0.2,
              "description": "fumaça leve dissipando acima do artista"
            }
          },
          "forces": {
            "gravity_strength": 1.0,
            "air_drag": 0.6,
            "turbulence": 0.5,
            "updraft": 0.5
          },
          "damage_response": {
            "environment": {
              "glass_break": false,
              "nearby_fixtures_shake": false,
              "dust_from_walls": false
            },
            "character_reaction": {
              "cloth_flap_intensity": 0.3,
              "hair_movement": 0.2,
              "body_recoil": 0.1
            }
          }
        },
        "cinematic_prompt_en": "hyper realistic controlled stage pyrotechnic blast in front of a performer, a warm golden ignition flash shooting up from the stage floor, subtle air pressure barely affecting the artist, a vertical flame jet with fast-moving yellow-orange fire and high brightness, golden sparks spraying upward and then falling with realistic gravity and air drag, a thin layer of light gray smoke forming above the effect and slowly dissipating, reflections of the fire and sparks on metallic instruments and the artist's outfit, low-angle 35mm handheld camera capturing the performer and the pyro in the same frame, medium depth of field, crisp stage lighting mixed with the warm glow of the flames, negative prompt: no uncontrolled explosion, no building damage, no surreal sci-fi elements, no glitching particles"
      }
];
