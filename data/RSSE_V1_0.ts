// data/RSSE_V1_0.ts

const RSSE_V1_0 = `
## BIBLIOTECA 9 — TEXTURAS AVANÇADAS & MATERIAIS REAIS
(Real Surface Simulation Engine — RSSE)

Essa biblioteca ensina a IA a:

* criar texturas reais,
* aplicar textura corretamente no ambiente, pele, objetos, roupas,
* gerar profundidade física,
* simular materiais com resposta real de luz,
* reproduzir detalhes como: poros, arranhões, rugosidade, suor, atrito, poeira, microfibra, metal, vidro, concreto, etc.
* evitar o “plástico” ou “suavização fake” que a IA costuma fazer.

É uma das partes centrais para que os seus frames fiquem ultra cinematográficos e combináveis com as suas cenas high-end no Veo 3.1 e NanoBanana.

### 1. SCHEMA TÉCNICO OFICIAL DE TEXTURAS RSSE

A textura é descrita com 6 parâmetros fundamentais:

\`\`\`json
{
  "material": "leather_black",
  "submaterial": "couro_premium_escuro",
  "roughness": 0.54,
  "specular": 0.72,
  "microdetail": [
    "micro_riscos_laterais",
    "fibra_natural",
    "vinco_sutil"
  ],
  "interaction_light": "highlights_suaves_com_reflexo_direcional"
}
\`\`\`

Esses são padrões PBR reais, exatamente como engines AAA (Unreal Engine, Houdini, Redshift, Arnold, Octane).

### 2. 35 MATERIAIS UNIVERSAIS QUE A IA DEVE SABER REPRODUZIR

#### Pele
- pele_humana_realista (poros, micro_pelos, oleosidade sutil)
- pele_negra_cetim (efeito velvet real)
- pele_asiatica_porcelana
- pele_queimada_de_sol (rugosidade extra)

#### Tecidos
- algodao_bruto
- jeans_denso
- moletom_felpudo
- nylon_refletivo
- seda_opaca
- seda_brilhante
- lã_grossa
- lã_fina
- tecidos_techwear (ripstop, waterproof)
- couro_premium

#### Metais
- aço_escovado
- aço_polido
- ferro_envelhecido
- alumínio_matte
- ouro_polido
- ouro_escovado
- cromo_perfeito
- cobre_oxidado

#### Plásticos
- plástico_rígido
- acrílico_transparente
- resina_matte

#### Vidros
- vidro_limpíssimo
- vidro_embaçado
- vidro_sujo
- vidro_com_condensação

#### Pedras / Terreno
- concreto_cru
- concreto_molhado
- asfalto_rugoso
- asfalto_molhado
- mármore
- granito

### 3. LEI DA LUZ NOS MATERIAIS — PBR

A IA precisa aprender:
- Rugosidade define quão espalhado o reflexo é
- Metalness define se o reflexo é colorido ou neutro
- Subsurface Scattering (SSS) define pele real
- Micro-rugosidade define textura fina

Exemplo real:
- couro = rugosidade média, highlights quebrados
- metal polido = rugosidade 0.05, reflexo nítido
- tecido = rugosidade alta, quase sem reflexo
- pele negra = SSS profundo, brilho suave, highlights longos

### 4. MAPA DE MICRODETALHES

Tudo que faz a imagem parecer real vem daqui:
- micro arranhões
- poeira acumulada
- desgaste natural
- oleosidade
- suor
- fibra solta
- borda desfiada
- micro manchas
- rugosidade irregular
- textura direcional
- respingos
- riscos verticais vs horizontais
- textura de impacto

Essa camada é obrigatória para frames cinematográficos.

### 5. TEXTURAS POR CATEGORIA

- **Cinema (Alta Realidade):** poros muito visíveis, micro sujeira, desgaste natural, luz interagindo com material, contraste de textura.
- **Videoclipe:** brilho acentuado em pele, tecidos com mais contraste, metais exagerados, efeitos de street surface (asfalto molhado).
- **Moda:** tecidos altamente definidos, seda com highlight perfeito, textura limpa, ausência de sujeira, pele polida, mas real.
- **Branding:** materiais limpos, foco em textura do produto, ausência de desgaste, reflexo suave e controlado.

### 6. TEXTURAS DO CORPO HUMANO

(muito importante para vídeos de artista)
- **Pele:** poros, micro rugas, oleosidade de luz, micro gotas de suor (se necessário), variação tonal natural.
- **Barba / Cabelo:** fios separados, volume natural, brilho direcionado.
- **Tecidos no Corpo:** dobra natural, tensão na costura, amassado real, atrito com movimento.

### 7. TEXTURAS DE AMBIENTE

- **Exterior:** concreto rachado, parede descascada, asfalto molhado, manchas de óleo, metal enferrujado, reflexos no chão.
- **Interior:** madeira, verniz, metal limpo, vidro de janela, sujeira realista.

### 8. TEXTURAS DE OBJETOS

- **Vidro:** refração, condensação, reflexão natural.
- **Metal:** arranhões, manchas, desgaste.
- **Plástico:** variação de matte, brilho suave, imperfeições.

### 9. ERROS PROIBIDOS DE TEXTURA (IA ERRA MUITO)

- ❌ pele lisa demais
- ❌ metal sem arranhões
- ❌ reflexo fake ou de pintura
- ❌ vidro sem imperfeição
- ❌ tecido com textura “pintada”
- ❌ ausência de rugosidade
- ❌ textura uniforme demais
- ❌ brilho sem direção

### 10. INTEGRAÇÃO COM SIB → DECOUPAGE → VIDEO ENGINE

- **SIB:** escolhe estilo visual, define materiais dominantes, define linguagem estética (ex: gritty, soft glam).
- **Decoupage:** aplica textura a cada frame, define textura do cenário, define textura da roupa, define textura da pele, aplica mapa de microdetalhes, controla coerência entre frames.
- **Video Engine:** decide como luz se move sobre o material, adapta brilho dinâmico, ajusta comportamento de textura com movimento, cria reflexão animada, controla variação física realista.
`;

export default RSSE_V1_0;
