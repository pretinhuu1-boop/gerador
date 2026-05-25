// data/remotion_catalog.ts
//
// Curated catalog of the Remotion ecosystem (official + community) — templates,
// libraries, skills (hooks/utilities) and full pipeline workflows.
// Seeded into hermes_knowledge so Content/Editor agents can `recall_knowledge`
// and recommend the right Remotion building block for a given brief.
//
// Source: research agent sweep (May 2026) — see PR description / commit msg.

export interface RemotionItem {
  /** Stable slug used as the (kind, slug) key in hermes_knowledge. */
  slug: string;
  /** Human-facing name. */
  name: string;
  /** Short pitch — what it does in 1 sentence. */
  summary: string;
  /** Long description used as the embedding target + retrieval body. */
  description: string;
  /** Where to find it (npm install, github URL, docs URL). */
  link: string;
  /** Optional pkg/install hint (used by the model when proposing). */
  install?: string;
  /** Free-form tags — formato, niche, technology, etc. */
  tags: string[];
}

// ─── Templates (full compositions / starters) ────────────────────────────────
export const remotionTemplates: RemotionItem[] = [
  {
    slug: 'template_tiktok_official',
    name: 'template-tiktok (official)',
    summary: 'Base 9:16 TikTok com captions word-by-word via Whisper.cpp.',
    description:
      'Template oficial Remotion pra Shorts/TikTok 9:16. Vem com captions auto-sync word-level via @remotion/install-whisper-cpp e suporte a beat-by-beat narration. Ponto de partida ideal pra qualquer canal faceless de Stories/Reddit/Scary/Top.',
    link: 'https://github.com/remotion-dev/template-tiktok',
    install: 'npx create-video --template=remotion-dev/template-tiktok',
    tags: ['9:16', 'tiktok', 'shorts', 'reels', 'captions', 'whisper', 'oficial'],
  },
  {
    slug: 'template_audiogram_official',
    name: 'template-audiogram (official)',
    summary: 'Podcast clip 9:16/1:1 com waveform + captions (SRT ou @remotion/captions).',
    description:
      'Template oficial pra criar audiograms — clips de podcast/voice com waveform reativo e legendas sincronizadas. Ideal pra ASMR, sleep stories, motivational quotes, audiobook teasers. Aceita .srt direto ou Caption[] de Whisper/ElevenLabs alignment.',
    link: 'https://github.com/remotion-dev/template-audiogram',
    install: 'npx create-video --template=remotion-dev/template-audiogram',
    tags: ['9:16', '1:1', 'audiogram', 'podcast', 'asmr', 'sleep', 'waveform', 'oficial'],
  },
  {
    slug: 'template_music_visualization_official',
    name: 'template-music-visualization (official)',
    summary: 'Snippet musical 9:16 com visualizador reativo (FFT bars).',
    description:
      'Template oficial pra criar visualizers de música — pega um MP3, gera waveform/FFT animado em 9:16. Bom pra lo-fi clips, ASMR ambient, beat preview, Spotify-to-Reels.',
    link: 'https://github.com/remotion-dev/template-music-visualization',
    install: 'npx create-video --template=remotion-dev/template-music-visualization',
    tags: ['9:16', 'music', 'lo-fi', 'asmr', 'visualizer', 'fft', 'oficial'],
  },
  {
    slug: 'template_prompt_to_video_official',
    name: 'template-prompt-to-video (official)',
    summary: 'CLI prompt → OpenAI script+imagens → ElevenLabs voz → MP4 render.',
    description:
      'Template oficial REFERÊNCIA pro pipeline Hermes-style. CLI que recebe prompt, gera roteiro via OpenAI, imagens via DALL-E, voz via ElevenLabs, e renderiza um vídeo final 9:16. Mostra o padrão canônico de orchestration que dá pra clonar/adaptar.',
    link: 'https://github.com/remotion-dev/template-prompt-to-video',
    install: 'git clone https://github.com/remotion-dev/template-prompt-to-video',
    tags: ['pipeline', 'cli', 'prompt-to-video', 'openai', 'elevenlabs', 'oficial', 'referencia'],
  },
  {
    slug: 'template_shorts_customizer_official',
    name: 'shorts-customizer (official)',
    summary: 'Customizador interativo de Shorts dentro do <Player>.',
    description:
      'Template oficial — interface no <Player> pra customizar Shorts em real-time (texto, cores, branding) antes de renderizar. Pattern útil pra usuário "tweakar" um template antes de bater render.',
    link: 'https://github.com/remotion-dev/shorts-customizer',
    install: 'git clone https://github.com/remotion-dev/shorts-customizer',
    tags: ['shorts', 'customizer', 'player', 'interactive', 'oficial'],
  },
  {
    slug: 'template_skia_official',
    name: 'template-skia (official)',
    summary: 'Base com React Native Skia pra GPU effects pesados.',
    description:
      'Template oficial pra usar React Native Skia dentro de Remotion — efeitos GPU (shaders, blur, color grading) que CSS/Canvas não dão conta. Esforço médio-alto, mas necessário pra visual polido em ASMR/cinematic.',
    link: 'https://github.com/remotion-dev/template-skia',
    tags: ['skia', 'gpu', 'shaders', 'effects', 'oficial', 'advanced'],
  },
  {
    slug: 'template_three_official',
    name: 'template-three (official)',
    summary: 'Base com React Three Fiber (Three.js) — cenas 3D em Remotion.',
    description:
      'Template oficial pra cenas 3D via R3F. Bom pra hooks que demandam profundidade (objetos rotacionando, ambientes 3D, mockups). Esforço alto, mas único caminho pra 3D real.',
    link: 'https://github.com/remotion-dev/template-three',
    tags: ['3d', 'three', 'r3f', 'oficial', 'advanced'],
  },
  {
    slug: 'template_code_hike_official',
    name: 'template-code-hike (official)',
    summary: 'Snippets de código animados — dev content.',
    description:
      'Template oficial pra animar código (typing, highlighting, transições entre arquivos). Específico pra nichos de programação/dev — fora do escopo dark content faceless mainstream, mas útil pra subcanais técnicos.',
    link: 'https://github.com/remotion-dev/template-code-hike',
    tags: ['16:9', 'code', 'dev', 'tutorial', 'oficial'],
  },
  {
    slug: 'template_render_server_official',
    name: 'template-render-server (official)',
    summary: 'Servidor Express com endpoint POST /render → MP4.',
    description:
      'Template oficial pra expor render via HTTP. Padrão simples pra integrar Remotion em backend não-Node (Python/Go/etc) chamando via REST. Pattern útil enquanto Lambda não é necessário.',
    link: 'https://github.com/remotion-dev/template-render-server',
    tags: ['render', 'server', 'express', 'rest', 'oficial', 'backend'],
  },
  {
    slug: 'superviral_community',
    name: 'superviral (community)',
    summary: 'Next.js + Remotion + Google TTS — Reddit/FakeChat/SplitScreen.',
    description:
      'Repo community com 3 templates prontos: Reddit Story (narrativa em primeira pessoa), FakeChat (chat tipo iMessage falso), SplitScreen (gameplay em baixo + narração em cima — o famoso "Subway Surfers brain rot"). UI Zustand + Tailwind. Vale fork pra swap TTS por ElevenLabs.',
    link: 'https://github.com/vaibhavvTripathi/superviral',
    tags: ['9:16', 'reddit', 'fakechat', 'splitscreen', 'community', 'brain-rot', 'next.js'],
  },
  {
    slug: 'remotion_lyrics_community',
    name: 'remotion-lyrics (community)',
    summary: 'Lyric video de áudio + loop com captions Whisper.',
    description:
      'Template comunidade pra lyric videos — recebe áudio + texto, transcreve via Whisper, sincroniza letras com timeline. 9:16 e 16:9.',
    link: 'https://github.com/rayanfer32/remotion-lyrics',
    tags: ['9:16', '16:9', 'lyrics', 'music', 'whisper', 'community'],
  },
  {
    slug: 'karaoke_remotion_community',
    name: 'karaoke-remotion (community)',
    summary: 'Karaoke com highlight word-level via Whisper.',
    description:
      'Template comunidade pra karaoke — destaca a palavra atual sendo cantada (word-level highlight) usando timing do Whisper. 9:16. Pattern reusável pra "narration karaoke" em qualquer Shorts.',
    link: 'https://github.com/binhkid2/karaoke-remotion',
    tags: ['9:16', 'karaoke', 'lyrics', 'whisper', 'community', 'word-highlight'],
  },
  {
    slug: 'reactvideoeditor_effects_pack',
    name: 'reactvideoeditor/remotion-templates',
    summary: '81 efeitos/animações free prontos pra colar.',
    description:
      'Repo com 81 efeitos e animações Remotion gratuitos — transitions, text effects, particle systems, glitches, color grades. Não é template fechado: é biblioteca de receitas pra remixar em qualquer composition.',
    link: 'https://github.com/reactvideoeditor/remotion-templates',
    tags: ['effects', 'animations', 'snippets', 'recipes', 'community', 'free'],
  },
  {
    slug: 'quriosity_prompts',
    name: 'Quriosity-agent/remotion-prompts',
    summary: '21 prompts curados de remotion.dev/prompts — dataset pro Hermes.',
    description:
      'Coleção de 21 prompts oficiais Remotion (Audio Spectrum Visualizer, Captions, Lower-thirds, etc) em formato fácil de consumir. Bom dataset pro Hermes "aprender" padrões Remotion sem ler doc toda.',
    link: 'https://github.com/Quriosity-agent/remotion-prompts',
    tags: ['prompts', 'dataset', 'reference', 'community'],
  },
];

// ─── Libraries (NPM packages) ────────────────────────────────────────────────
export const remotionLibraries: RemotionItem[] = [
  {
    slug: 'pkg_remotion_core',
    name: 'remotion (core)',
    summary: 'Core: <Composition>, interpolate, Sequence, useCurrentFrame.',
    description:
      'Pacote core. Importa <Composition>, <Sequence>, <AbsoluteFill>, interpolate, useCurrentFrame, useVideoConfig, spring, Easing. Base de qualquer composition.',
    link: 'https://www.remotion.dev/docs/api',
    install: 'npm i remotion',
    tags: ['core', 'oficial'],
  },
  {
    slug: 'pkg_remotion_player',
    name: '@remotion/player',
    summary: 'Player React pra preview no app/admin.',
    description:
      'Player React standalone. Embuti previews de compositions no app sem precisar rodar studio. Já usado no DraftDetail tab Preview do Channel OS.',
    link: 'https://www.remotion.dev/docs/player',
    install: 'npm i @remotion/player',
    tags: ['player', 'preview', 'oficial'],
  },
  {
    slug: 'pkg_remotion_lambda',
    name: '@remotion/lambda',
    summary: 'Render distribuído AWS Lambda (~$0.01/min 1080p).',
    description:
      'Render serverless via Lambda. Paralelismo automático (1 short 60s renderiza em <30s, frames-per-lambda=12), ~$0.01/min de vídeo 1080p ARM64 us-east-1. Ideal pra produção quando precisar escalar batch render multi-canal.',
    link: 'https://www.remotion.dev/docs/lambda',
    install: 'npm i @remotion/lambda',
    tags: ['lambda', 'aws', 'render', 'serverless', 'production', 'oficial'],
  },
  {
    slug: 'pkg_remotion_cloudrun',
    name: '@remotion/cloudrun',
    summary: 'Render distribuído GCP Cloud Run (alternativa Lambda).',
    description:
      'Wrapper Cloud Run pra render serverless quando o stack já tá no GCP. Alternativa direta ao Lambda — mesmo padrão de API.',
    link: 'https://www.remotion.dev/docs/cloudrun',
    install: 'npm i @remotion/cloudrun',
    tags: ['cloudrun', 'gcp', 'render', 'serverless', 'oficial'],
  },
  {
    slug: 'pkg_remotion_renderer',
    name: '@remotion/renderer',
    summary: 'Render Node/Bun standalone (self-host).',
    description:
      'API programática pra renderizar MP4 no próprio servidor (Node/Bun). Usado quando o gateway Python dispara render via subprocess. Já adotado no plano de render local do Channel OS.',
    link: 'https://www.remotion.dev/docs/renderer',
    install: 'npm i @remotion/renderer',
    tags: ['render', 'self-host', 'node', 'cli', 'oficial'],
  },
  {
    slug: 'pkg_remotion_captions',
    name: '@remotion/captions',
    summary: 'Tipo Caption + serialize/parse SRT + tiktok-style helpers.',
    description:
      'Pacote oficial pra trabalhar com captions: tipo Caption{token, startMs, endMs}, parseSrt/serializeSrt, createTikTokStyleCaptions (agrupa word-timestamps em frases curtas estilo karaoke pop). Compat ElevenLabs alignment + Whisper.',
    link: 'https://www.remotion.dev/docs/captions/api',
    install: 'npm i @remotion/captions',
    tags: ['captions', 'srt', 'whisper', 'elevenlabs', 'tiktok-style', 'oficial'],
  },
  {
    slug: 'pkg_remotion_transitions',
    name: '@remotion/transitions',
    summary: '<TransitionSeries> com presets fade/slide/wipe entre beats.',
    description:
      'TransitionSeries pra transições declarativas entre Sequences. Presets: fade, slide, wipe, flip. Substitui interpolate manual em transições padronizadas.',
    link: 'https://www.remotion.dev/docs/transitions',
    install: 'npm i @remotion/transitions',
    tags: ['transitions', 'fade', 'slide', 'wipe', 'oficial'],
  },
  {
    slug: 'pkg_remotion_media_utils',
    name: '@remotion/media-utils',
    summary: 'getAudioDurationInSeconds, useAudioData, visualizeAudio.',
    description:
      'Utils essenciais: getAudioDurationInSeconds (lê MP3 do ElevenLabs pra setar duração exata do beat), useAudioData (carrega samples), visualizeAudio (FFT bars por frame), visualizeAudioWaveform (waveform de voz), useWindowedAudioData (essencial pra narração longa sem OOM).',
    link: 'https://www.remotion.dev/docs/media-utils',
    install: 'npm i @remotion/media-utils',
    tags: ['audio', 'duration', 'waveform', 'fft', 'visualize', 'oficial', 'essencial'],
  },
  {
    slug: 'pkg_remotion_google_fonts',
    name: '@remotion/google-fonts',
    summary: 'Catalog tipado de Google Fonts com tree-shaking.',
    description:
      'Google Fonts tipadas — `loadFont` por família, tree-shake quem não usa. Recomendado em vez do <link> manual pra garantir font ready antes de render frame.',
    link: 'https://www.remotion.dev/docs/google-fonts',
    install: 'npm i @remotion/google-fonts',
    tags: ['fonts', 'google-fonts', 'typography', 'oficial'],
  },
  {
    slug: 'pkg_remotion_shapes',
    name: '@remotion/shapes',
    summary: '<Triangle>, <Star>, <Pie> SVG animáveis.',
    description:
      'Primitivos SVG (Triangle, Star, Pie, Circle, Rect) com props animáveis. Útil pra overlays decorativos, CTAs estilizados, decorações de hook.',
    link: 'https://www.remotion.dev/docs/shapes',
    install: 'npm i @remotion/shapes',
    tags: ['shapes', 'svg', 'overlays', 'oficial'],
  },
  {
    slug: 'pkg_remotion_paths',
    name: '@remotion/paths',
    summary: 'Utils SVG path — interpolate, bbox, reverse.',
    description:
      'Manipulação de SVG paths: interpolate entre 2 paths (morph), bounding box, reverse direction. Bom pra animações path-drawn (linha desenhando, texto sendo escrito).',
    link: 'https://www.remotion.dev/docs/paths',
    install: 'npm i @remotion/paths',
    tags: ['svg', 'paths', 'morph', 'animation', 'oficial'],
  },
  {
    slug: 'pkg_remotion_noise',
    name: '@remotion/noise',
    summary: 'Noise functions tipadas — grain/glitch fx.',
    description:
      'Funções de noise (perlin, simplex) pra efeitos de grain, glitch, texture overlay. Subtle film grain dá feel cinematográfico em qualquer template.',
    link: 'https://www.remotion.dev/docs/noise',
    install: 'npm i @remotion/noise',
    tags: ['noise', 'grain', 'glitch', 'effects', 'oficial'],
  },
  {
    slug: 'pkg_remotion_motion_blur',
    name: '@remotion/motion-blur',
    summary: '<Trail> + <CameraMotionBlur> HOCs.',
    description:
      'HOCs pra motion blur: <Trail> deixa rastro do elemento em movimento, <CameraMotionBlur> blur global em câmera rápida. Adiciona feel cinematográfico de movimento.',
    link: 'https://www.npmjs.com/package/@remotion/motion-blur',
    install: 'npm i @remotion/motion-blur',
    tags: ['motion-blur', 'cinematic', 'effects', 'oficial'],
  },
  {
    slug: 'pkg_remotion_animation_utils',
    name: '@remotion/animation-utils',
    summary: 'Helpers de animation/easing reutilizáveis.',
    description:
      'Helpers tipo makeTransform, easings customizados, interpolate builders. Reduz boilerplate em composition complexa.',
    link: 'https://www.remotion.dev/docs/animation-utils',
    install: 'npm i @remotion/animation-utils',
    tags: ['animation', 'easing', 'utils', 'oficial'],
  },
  {
    slug: 'pkg_remotion_lottie',
    name: '@remotion/lottie',
    summary: '<Lottie> typesafe (animações LottieFiles/AE).',
    description:
      'Componente <Lottie> tipado pra animações exportadas de After Effects/LottieFiles. Solução padrão pra UI animations sem precisar codificar à mão.',
    link: 'https://www.remotion.dev/docs/lottie',
    install: 'npm i @remotion/lottie',
    tags: ['lottie', 'after-effects', 'animations', 'oficial'],
  },
  {
    slug: 'pkg_remotion_rive',
    name: '@remotion/rive',
    summary: 'Rive animations (lighter/faster que Lottie).',
    description:
      'Suporte a Rive — alternativa moderna ao Lottie, arquivos menores e GPU-accelerated. Útil pra animações de UI interativas reusadas em vídeo.',
    link: 'https://www.remotion.dev/docs/rive',
    install: 'npm i @remotion/rive',
    tags: ['rive', 'animations', 'gpu', 'oficial'],
  },
  {
    slug: 'pkg_remotion_gif',
    name: '@remotion/gif',
    summary: '<Gif> + getGifDurationInSeconds.',
    description:
      'Renderizar GIFs como camadas em composition. Útil pra meme content, reaction stickers, loops curtos.',
    link: 'https://www.remotion.dev/docs/gif',
    install: 'npm i @remotion/gif',
    tags: ['gif', 'memes', 'overlays', 'oficial'],
  },
  {
    slug: 'pkg_remotion_preload',
    name: '@remotion/preload',
    summary: 'preloadVideo/Audio/Font/Image — evita stalls.',
    description:
      'API pra pré-carregar assets antes do Player iniciar. Evita flicker/stall ao trocar de beat. Essencial em previews longas.',
    link: 'https://www.remotion.dev/docs/preload',
    install: 'npm i @remotion/preload',
    tags: ['preload', 'performance', 'player', 'oficial'],
  },
  {
    slug: 'pkg_remotion_zod_types',
    name: '@remotion/zod-types',
    summary: 'zColor(), zTextarea(), zMatrix() pra schema de props.',
    description:
      'Tipos Zod customizados que o Remotion Studio renderiza como inputs ricos (color picker, textarea, matrix). Permite que Hermes gere JSON tipado de props pra qualquer composition + UI auto-gera form.',
    link: 'https://www.remotion.dev/docs/zod-types',
    install: 'npm i @remotion/zod-types',
    tags: ['zod', 'schema', 'props', 'studio', 'oficial'],
  },
  {
    slug: 'pkg_remotion_tailwind_v4',
    name: '@remotion/tailwind-v4',
    summary: 'Tailwind v4 dentro do bundler Remotion.',
    description:
      'Plugin pra usar Tailwind v4 em compositions. Channel OS usa Tailwind 3 atualmente — futura migração v4 ganharia esse plugin.',
    link: 'https://www.remotion.dev/docs/tailwind/tailwind-v4',
    install: 'npm i @remotion/tailwind-v4',
    tags: ['tailwind', 'bundler', 'oficial'],
  },
  {
    slug: 'pkg_remotion_install_whisper_cpp',
    name: '@remotion/install-whisper-cpp',
    summary: 'Instala Whisper.cpp cross-platform + transcribe local.',
    description:
      'Auto-instala Whisper.cpp e transcreve áudios localmente. Word-level timestamps. Custo zero, CPU pesada — ótimo pra dev/preview, na prod alternativa OpenAI Whisper API se preferir.',
    link: 'https://www.remotion.dev/docs/install-whisper-cpp',
    install: 'npm i @remotion/install-whisper-cpp',
    tags: ['whisper', 'captions', 'transcribe', 'local', 'oficial'],
  },
  {
    slug: 'pkg_remotion_openai_whisper',
    name: '@remotion/openai-whisper',
    summary: 'Wrapper OpenAI Whisper API → Caption[].',
    description:
      'Converte resposta da OpenAI Whisper API pro formato Caption[]. Use quando não quiser carga de CPU local. ~$0.006/min.',
    link: 'https://www.remotion.dev/docs/openai-whisper',
    install: 'npm i @remotion/openai-whisper',
    tags: ['whisper', 'openai', 'api', 'captions', 'oficial'],
  },
  {
    slug: 'pkg_remotion_layout_utils',
    name: '@remotion/layout-utils',
    summary: 'Layout helpers — fit text, measure DOM.',
    description:
      'Helpers pra calcular layouts dinamicamente: fit text em área, measure DOM antes do render. Útil pra captions que se adaptam ao tamanho da tela.',
    link: 'https://www.remotion.dev/docs/layout-utils',
    install: 'npm i @remotion/layout-utils',
    tags: ['layout', 'text-fit', 'measure', 'oficial'],
  },
  {
    slug: 'pkg_remotion_mcp',
    name: '@remotion/mcp',
    summary: 'MCP server oficial — Claude/Gemini geram comps.',
    description:
      'Servidor MCP (Model Context Protocol) oficial Remotion. Expõe ferramentas pra LLMs (Claude Desktop, Gemini) gerarem compositions diretamente. Vale plugar como tool no Hermes Gateway pra geração ad-hoc de compositions novas.',
    link: 'https://www.remotion.dev/docs/mcp',
    install: 'npm i @remotion/mcp',
    tags: ['mcp', 'ai', 'llm', 'codegen', 'oficial'],
  },
  {
    slug: 'pkg_remotion_animated_community',
    name: 'remotion-animated (community)',
    summary: '<Animated animations={[Move,Fade,Scale,Rotate]}> declarativo.',
    description:
      'API declarativa pra animações dentro de JSX — em vez de useCurrentFrame+interpolate, passa array de animations props. Reduz boilerplate em compositions com muitas micro-animações.',
    link: 'https://github.com/stefanwittwer/remotion-animated',
    install: 'npm i remotion-animated',
    tags: ['animations', 'declarative', 'community'],
  },
  {
    slug: 'pkg_remotion_subtitles_community',
    name: 'remotion-subtitles (ahgsql)',
    summary: 'Parse SRT + caption components animados drop-in.',
    description:
      'Componentes <Subtitles src=".srt"> drop-in com animações built-in (typewriter, fade, pop). Mais simples que @remotion/captions pra caso de uso básico.',
    link: 'https://github.com/ahgsql/remotion-subtitles',
    install: 'npm i remotion-subtitles',
    tags: ['subtitles', 'srt', 'captions', 'community'],
  },
];

// ─── Skills (utilities / hooks / patterns) ───────────────────────────────────
export const remotionSkills: RemotionItem[] = [
  {
    slug: 'skill_audio_duration',
    name: 'getAudioDurationInSeconds',
    summary: 'Lê MP3/WAV e retorna duração exata em segundos.',
    description:
      'Função do @remotion/media-utils. Setar `durationInFrames` da Composition com base na duração real do MP3 do ElevenLabs (em vez de estimar por chars). Padrão pra alinhar narração ↔ duration.',
    link: 'https://www.remotion.dev/docs/get-audio-duration-in-seconds',
    tags: ['audio', 'duration', 'pattern', 'essencial'],
  },
  {
    slug: 'skill_use_windowed_audio',
    name: 'useWindowedAudioData',
    summary: 'Carrega só janela do áudio ao redor do frame atual.',
    description:
      'Pra narração longa (>2min), useAudioData carrega tudo em RAM. useWindowedAudioData carrega só os samples necessários ao frame atual — evita OOM em renders de vídeos longos.',
    link: 'https://www.remotion.dev/docs/use-windowed-audio-data',
    tags: ['audio', 'performance', 'memory', 'long-form', 'pattern'],
  },
  {
    slug: 'skill_visualize_audio',
    name: 'visualizeAudio / visualizeAudioWaveform',
    summary: 'Espectro FFT (bars) ou waveform (voz) por frame.',
    description:
      'Duas funções do @remotion/media-utils. visualizeAudio retorna magnitudes FFT (32-64 bins) — ideal pra music viz. visualizeAudioWaveform retorna samples crus — ideal pra voz/podcast.',
    link: 'https://www.remotion.dev/docs/visualize-audio',
    tags: ['audio', 'fft', 'waveform', 'audiogram', 'pattern'],
  },
  {
    slug: 'skill_calculate_metadata',
    name: 'calculateMetadata()',
    summary: 'Resolve fps/duração/dim dinamicamente por inputProps.',
    description:
      'Function passada pra <Composition calculateMetadata={...}>. Recebe inputProps e retorna {durationInFrames, fps, width, height}. Hermes manda só os beats + audio_urls, calculateMetadata soma as durações reais e seta o resto.',
    link: 'https://www.remotion.dev/docs/calculate-metadata',
    tags: ['metadata', 'dynamic-duration', 'pattern', 'essencial'],
  },
  {
    slug: 'skill_caption_srt',
    name: 'parseSrt / serializeSrt',
    summary: 'Ida-volta SRT ↔ Caption[] (compat ElevenLabs + Whisper).',
    description:
      'Funções do @remotion/captions. ElevenLabs retorna alignment word-level — serializeSrt salva como .srt. Whisper retorna .srt — parseSrt converte pra Caption[]. Mesma estrutura, qualquer source funciona.',
    link: 'https://www.remotion.dev/docs/captions/serialize-srt',
    tags: ['captions', 'srt', 'whisper', 'elevenlabs', 'pattern'],
  },
  {
    slug: 'skill_preload_assets',
    name: 'preloadVideo / preloadAudio / preloadFont / preloadImage',
    summary: 'Evita flicker no Player ao trocar beats.',
    description:
      'Antes de mostrar <Player>, chamar preloadX(url) garante que asset tá em cache. Sem isso, primeiro beat com asset novo dá hiccup. Crítico pra UX de preview.',
    link: 'https://www.remotion.dev/docs/preload',
    tags: ['preload', 'player', 'ux', 'pattern'],
  },
  {
    slug: 'skill_audio_spectrum_prompt',
    name: 'Audio Spectrum Visualizer (Remotion prompt oficial)',
    summary: '32 bars dark + gradient magenta→cyan reagindo a bass/mid/high.',
    description:
      'Prompt oficial Remotion que gera audio spectrum visualizer pronto: 32 bars, gradient magenta→cyan, separação bass/mid/high. Copia pro ContentAgent system prompt como exemplo canônico.',
    link: 'https://www.remotion.dev/prompts/audio-spectrum-visualizer',
    tags: ['audio', 'spectrum', 'visualizer', 'prompt', 'reference'],
  },
];

// ─── Workflows (full pipelines / repos) ──────────────────────────────────────
export const remotionWorkflows: RemotionItem[] = [
  {
    slug: 'workflow_short_video_maker_gyoridavid',
    name: 'gyoridavid/short-video-maker',
    summary: 'Script→Kokoro TTS→Whisper captions→Remotion render→MP4. MCP+REST. Docker.',
    description:
      'Repo OSS 1.1k★ com pipeline arquiteturalmente similar ao Hermes: orquestrador → TTS local Kokoro → Whisper.cpp captions → Remotion render. Expõe servidor MCP e REST. Background music por mood. Roda em Docker. MIT. VALE PLUGAR: trocar Kokoro por ElevenLabs e adotar o padrão MCP/REST como referência.',
    link: 'https://github.com/gyoridavid/short-video-maker',
    tags: ['pipeline', 'workflow', 'mcp', 'docker', 'kokoro', 'whisper', 'mit', 'reference'],
  },
  {
    slug: 'workflow_superviral_vaibhav',
    name: 'vaibhavvTripathi/superviral',
    summary: 'Next.js + Remotion + Google TTS — Reddit/FakeChat/SplitScreen.',
    description:
      '3 modos de short prontos com UI (Zustand + Tailwind). Vale fork pra adotar templates Reddit/FakeChat/SplitScreen e swap Google TTS por ElevenLabs.',
    link: 'https://github.com/vaibhavvTripathi/superviral',
    tags: ['pipeline', 'next.js', 'reddit', 'fakechat', 'splitscreen', 'reference'],
  },
  {
    slug: 'workflow_prompt_to_video_official',
    name: 'remotion-dev/template-prompt-to-video',
    summary: 'CLI prompt → OpenAI script+imagens → ElevenLabs voz → render.',
    description:
      'Pipeline oficial canônica. Pattern direto pro fluxo Hermes/Gemini/ElevenLabs. Estudo obrigatório antes de implementar render server next phase.',
    link: 'https://github.com/remotion-dev/template-prompt-to-video',
    tags: ['pipeline', 'cli', 'openai', 'elevenlabs', 'oficial', 'canonical'],
  },
  {
    slug: 'workflow_yumcut',
    name: 'IgorShadurin/app.yumcut.com',
    summary: 'Next.js full-stack: prompt→cenas→voz→subtitles→watermark. Batch+API.',
    description:
      'Stack TS (Next.js + FFmpeg + Remotion) com batch render + API hooks + multi-language. Vale estudar UX de batch processing e patterns de hooks de API.',
    link: 'https://github.com/IgorShadurin/app.yumcut.com',
    tags: ['pipeline', 'next.js', 'ffmpeg', 'batch', 'api', 'reference'],
  },
  {
    slug: 'workflow_remotion_studio_monorepo',
    name: 'Takamasa045/remotion-studio-monorepo',
    summary: 'Monorepo: apps/_template clona por projeto, render isolado.',
    description:
      'Pattern pra escalar N canais num único repo Remotion — cada canal vira app/ herdeiro de _template. Vale plugar quando Channel OS quiser separar branding/templates por canal.',
    link: 'https://github.com/Takamasa045/remotion-studio-monorepo',
    tags: ['monorepo', 'multi-channel', 'scaling', 'reference'],
  },
  {
    slug: 'workflow_lambda_sqs',
    name: 'Remotion Lambda + SQS (oficial pattern)',
    summary: 'Fila SQS → renderMediaOnLambda paralelo → S3.',
    description:
      'Pattern oficial pra batch render multi-canal serverless. Drop jobs em SQS, Lambda consumer renderiza paralelo, output no S3. Setup quando Channel OS for production-scale.',
    link: 'https://www.remotion.dev/docs/lambda/sqs',
    tags: ['lambda', 'sqs', 's3', 'queue', 'production', 'scale', 'oficial'],
  },
];

export const remotionCatalog = {
  templates: remotionTemplates,
  libraries: remotionLibraries,
  skills: remotionSkills,
  workflows: remotionWorkflows,
};
