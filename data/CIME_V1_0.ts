// data/CIME_V1_0.ts

const CIME_V1_0 = `
## BIBLIOTECA 12 — MOVIMENTO INTERNO DA CENA (Cinematic Internal Motion Engine – CIME)

Este documento instrui a IA sobre como adicionar movimento interno realista e sutil a uma cena, tornando-a viva e crível.

### 1. SCHEMA TÉCNICO OFICIAL DO MOVIMENTO INTERNO
{
  "vento": {
    "intensidade": "leve",
    "direcao": "sudeste",
    "variacao": "irregular_suave"
  },
  "movimento_tecidos": {
    "tipo": "fleeting_waves",
    "velocidade": "baixa",
    "direcao": "seguindo_vento"
  },
  "movimento_cabelo": {
    "intensidade": "micro_oscilacoes",
    "resposta_vento": "delicada",
    "gravidade": "forte"
  },
  "particulas": {
    "tipo": "poeira_fina",
    "velocidade": "baixa",
    "densidade": "leve",
    "comportamento": "sobe_e_cai"
  },
  "objetos_livres": {
    "latas": "oscilacao_minima",
    "folhas": "movimento_irregular"
  },
  "sombra_dinamica": {
    "intensidade": "média",
    "oscilacao": "leve"
  },
  "atmosfera": "respirando_sutilmente",
  "coerencia_com_movimento_camera": true
}

### 2. AS 8 FORÇAS FÍSICAS QUE GOVERNAM O AMBIENTE
- Gravidade
- Atrito do ar
- Turbulência de vento
- Inércia dos objetos
- Elasticidade do tecido
- Arrasto aerodinâmico
- Peso da atmosfera (umidade, densidade)
- Interação luz → partículas
A IA deve simular TODAS.

### 3. MOVIMENTO DO ATOR (FÍSICO + RESPIRAÇÃO)
O ator precisa se mover como um ser humano real, respeitando:
- **Micro-respiração:** peito sobe e desce levemente, criando micro-movimento nos ombros e pescoço.
- **Micro-ajustes posturais:** O corpo real nunca fica “parado”. Simular ajuste mínimo do quadril, leve correção de peso nas pernas, micro-rotação de ombros, piscadas naturais.
- **Movimento emocional:** A emoção cria movimento (determinação → peito avança; tristeza → ombros cedem).

### 4. MOVIMENTO DO AMBIENTE (VENTO + PARTÍCULAS)
- **Vento:** Deve ter direção, variação e intensidade. Vento move o ambiente, não apenas o cabelo. Vento arrasta partículas. Tipos: leve, moderado, forte, irregular.

### 5. OBJETOS COM MOVIMENTO REAL
Objetos devem reagir a peso, vento, atrito. Exemplos: folhas caindo, papel balançando, fumaça se dissipando, gotas d’água vibrando, corrente do ator com micro balanço, zíperes e cordões tremulando levemente.

### 6. MOVIMENTO DE LUZ & SOMBRA
A luz e a sombra se movem quando a câmera ou o ator se movem, ou quando o ambiente é modificado pelo vento. Reflexos se alteram com micro movimentos. Sombra muda suavemente com a respiração. Luz volumétrica reage a partículas.

### 7. MOVIMENTO EMOCIONAL (O AMBIENTE REAGE À NARRATIVA)
A emoção do personagem altera o ambiente:
- **Determinação / poder:** vento levemente mais forte, sombra mais definida.
- **Tristeza / introspecção:** ambiente mais parado, movimento caindo lentamente.
- **Tensão / conflito:** vento irregular, sombra pulsante.
- **Sedução:** movimento suave, respiração visual no ambiente.

### 8. ERROS PROIBIDOS NO MOVIMENTO
- ❌ objetos flutuarem
- ❌ cabelo se mexer sem vento
- ❌ vento que não afeta cenário
- ❌ partículas “teletransportando”
- ❌ fumaça se movendo rápido demais
- ❌ sombras tremendo sem sentido
- ❌ roupa reagindo como tecido falso
- ❌ movimentos que quebram física
- ❌ ambiente 100% estático (morte visual)
`;

export default CIME_V1_0;
