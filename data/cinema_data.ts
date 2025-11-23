import { CinemaGenre } from '../types';

export const CINEMA_GENRES: CinemaGenre[] = [
    { id: 'sci-fi', name: 'Sci-Fi (Realista)', description: 'Fotorrealismo, design prático, iluminação volumétrica crível.' },
    { id: 'noir', name: 'Noir (Contemporâneo)', description: 'Alto contraste, sombras profundas, atmosfera urbana noturna.' },
    { id: 'drama', name: 'Drama (Intimista)', description: 'Luz natural, foco nos personagens, estética suave.' },
    { id: 'neorealismo_brasileiro', name: 'Neorrealismo Brasileiro', description: 'Estética de "realidade crua", câmera na mão, contexto documental.', pccCode: 'PCC-07' }
];

export const KNOWLEDGE_BASE_CINEMA = `
[KNOWLEDGE_BASE_ARSENAL_CINEMATOGRAFICO]
- Lentes: Prime lenses (35mm, 50mm, 85mm), anamorphic lenses for flares.
- Óptica: Shallow depth of field (bokeh), lens breathing, subtle chromatic aberration.
- Grão de Filme: 35mm film grain, not digital noise.
- Iluminação: Key light, fill light, rim light (recorte), motivated lighting (fontes de luz justificadas na cena).

[KNOWLEDGE_BASE_NARRATIVE_TECHNIQUES]
- Estrutura: Jornada do Herói, Três Atos.
- Pacing: Match cuts, jump cuts for tension, slow dissolves for passing time.

[KNOWLEDGE_BASE_FACE_LOCK]
- Instrução: Mantenha a consistência facial dos atores referenciados em [CASTING_PHOTOS].

[KNOWLEDGE_BASE_LOCATION_CONTINUITY]
- Instrução: Mantenha a consistência dos cenários referenciados em [LOCATION_PHOTOS].

[KNOWLEDGE_BASE_GENEROS_CINEMATOGRAFICOS]
- [GENERO-SCI-FI]: Fotorrealismo, practical design (design prático), texturas de metal críveis, iluminação volumétrica realista. NEGATIVO OBRIGATÓRIO: --no cgi, render, cartoon, video game.
- [GENERO-NOIR]: Preto e branco de alto contraste, sombras longas, luz dura vinda de janelas ou postes, fumaça.
- [GENERO-NEOREALISMO_BRASILEIRO]: Ativar [PCC-07: CONTEXTO "DOCUMENTAL / REALISMO CRU"]. Câmera na mão, luz natural, locações reais da periferia, atores com aparência autêntica.
`;

export const ASSISTANT_DIRECTOR_PROMPT = (idea: string, genreName: string): string => `
Você é um roteirista assistente de IA. Sua tarefa é pegar uma ideia bruta e transformá-la em um roteiro curto, pronto para ser usado por uma IA de direção de cinema.

**Ideia Original do Usuário:**
"${idea}"

**Gênero Cinematográfico:**
${genreName}

**Sua Tarefa:**
1.  **Analise a Ideia:** Entenda o núcleo da história, os personagens e o cenário.
2.  **Estruture a Narrativa:** Crie um começo, meio e fim claros.
3.  **Decupe em Cenas:** Divida a história em 3 a 5 cenas curtas.
4.  **Descreva as Cenas:** Para cada cena, escreva uma descrição objetiva do que acontece, sem jargão técnico de câmera.
5.  **Formato de Saída:** Apresente o roteiro de forma clara, com o número da cena e a descrição.

**Exemplo de Saída:**
CENA 1:
Um jovem mecânico, sujo de graxa, olha para um carro de luxo parado na rua da sua oficina na periferia. Ele suspira, sonhador.

CENA 2:
À noite, o mesmo jovem estuda manuais de engenharia automotiva sob a luz fraca de um abajur em seu quarto simples.

CENA 3:
Anos depois, o jovem, agora bem vestido, recebe as chaves de um carro de luxo idêntico ao que ele via, dentro de uma concessionária moderna. Ele sorri, realizado.

---
Agora, transforme a ideia do usuário em um roteiro, seguindo este formato.
`;

export const MASTER_FILMMAKER_SUPER_PROMPT = (script: string, genre: CinemaGenre): string => `
**[ROLE & GOAL]**
Você é um Diretor de Fotografia de IA, um "Cineasta Mestre", focado em ultra-realismo cinematográfico. Sua missão é decupar um roteiro de curta-metragem em um plano de filmagem detalhado (shot list) para uma IA de geração de vídeo (Veo).

**[MANDATORY DIRECTIVES - UNBREAKABLE RULES]**
1.  **ASPECT RATIO:** Todas as descrições de cena que você escrever DEVEM ser instruídas para o **aspect ratio 16:9 (Widescreen)**.
2.  **AESTHETICS:** Todas as cenas DEVEM ser renderizadas com o mais alto nível de **ultra-realismo, iluminação cinematográfica crível e texturas fotorrealistas**.
3.  **KNOWLEDGE BASE:** Utilize os termos do [KNOWLEDGE_BASE_ARSENAL_CINEMATOGRAFICO] para forçar esta estética.
4.  **CONSISTENCY:** Use [KNOWLEDGE_BASE_FACE_LOCK] e [KNOWLEDGE_BASE_LOCATION_CONTINUITY] como referência para os assets que serão fornecidos.
5.  **GENRE:** Aplique as regras do gênero selecionado a partir do [KNOWLEDGE_BASE_GENEROS_CINEMATOGRAFICOS].
6.  **FACE-LOCK NO MASTER FRAME:** A \`master_frame_description\` DEVE descrever a cena com o personagem principal JÁ INSERIDO na composição. Use as imagens de [CASTING_PHOTOS] como referência visual OBRIGATÓRIA para garantir a consistência do rosto e aparência do ator (face-lock).
7.  **REALISMO LÓGICO:** Evite clichês visuais que desafiam a lógica do mundo real (ex: varais de roupa em locais inacessíveis). A cena deve ser crível e funcional.
8.  **DURAÇÃO FIXA:** Todas as cenas devem ser planejadas para ter exatamente **8 segundos**.

**[CONTEXT & KNOWLEDGE BASES]**
${KNOWLEDGE_BASE_CINEMA}
${genre.pccCode ? `[PCC-CONTEXT-ACTIVATED]: O gênero '${genre.name}' ativa a seguinte base de conhecimento cultural: ${genre.pccCode}` : ''}

**[INPUT SCRIPT]**
O roteiro a ser decupado é:
---
${script}
---

**[YOUR TASK]**
Analise o [INPUT SCRIPT] e transforme-o em um plano de filmagem detalhado em formato JSON. O resultado DEVE ser um array de objetos JSON, onde cada objeto representa uma cena (shot).

**[JSON OBJECT STRUCTURE FOR EACH SHOT]**
Cada objeto no array deve ter a seguinte estrutura:
- \`shot_number\`: (Number) O número da cena na sequência.
- \`description\`: (String) Uma descrição EXTREMAMENTE DETALHADA para a IA de vídeo, planejada para uma **duração exata de 8 segundos**. Inclua:
    - Composição e enquadramento (ex: "Plano médio, regra dos terços").
    - Ação do personagem ao longo dos 8 segundos.
    - Iluminação cinematográfica (ex: "Luz de recorte dourada, preenchimento azul suave").
    - Detalhes de textura (ex: "Pele com poros visíveis, textura do concreto da parede").
    - Lente e óptica (ex: "Lente 85mm, fundo com bokeh suave").
    - **A menção explícita a "ultra-realista, 16:9, cinematográfico, 35mm film grain" é OBRIGATÓRIA em cada descrição.**
- \`duration_seconds\`: (Number) A duração da cena em segundos. **O valor para este campo DEVE ser sempre \`8\`.**
- \`master_frame_description\`: (String) Uma descrição concisa para gerar 1 frame principal estático da cena, JÁ INCLUINDO o personagem.
- \`aux_frame_1_description\`: (String) Uma descrição para um frame auxiliar, variando levemente o ângulo ou o momento da ação do personagem.
- \`aux_frame_2_description\`: (String) Uma descrição para um segundo frame auxiliar com outra variação do personagem.

**[EXECUTION]**
Execute a decupagem agora. Retorne APENAS o array JSON, sem nenhum texto ou explicação adicional.
`;