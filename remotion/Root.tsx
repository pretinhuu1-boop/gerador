import { Composition } from 'remotion';
import { StoriesVertical, type StoriesVerticalProps } from './compositions/StoriesVertical';
import { RedditStories, type RedditStoriesProps } from './compositions/RedditStories';
import { TopList, type TopListProps } from './compositions/TopList';
import { Audiogram, type AudiogramProps } from './compositions/Audiogram';

const STORIES_DEFAULT: StoriesVerticalProps = {
  title: 'Hook example',
  hook: 'O que aconteceu em Saqqara em 2024 muda tudo que sabíamos do Egito.',
  beats: [
    { text: 'Câmara selada por 4.300 anos.', caption: 'Câmara selada', b_roll: 'Sand storm over pyramids' },
    { text: 'Inscrições mencionam um deus que sumiu dos registros.', caption: 'Deus apagado' },
    { text: 'Arqueólogos não conseguem traduzir 3 dos hieróglifos.', caption: 'Hieróglifo desconhecido' },
  ],
  cta: 'Salva pra parte 2',
  brand: 'channel os',
  accentColor: '#a855f7',
};

const REDDIT_DEFAULT: RedditStoriesProps = {
  title: 'AITA por contar pra família que meu irmão clonou minha vida?',
  hook: 'AITA por contar pra família que meu irmão clonou minha vida?',
  subreddit: 'r/AmItheAsshole',
  author: 'u/throwaway_2026',
  upvotes: 18400,
  commentCount: 612,
  beats: [
    { text: 'Tudo começou quando ele se mudou pro mesmo bairro que eu — sem me avisar.', caption: 'A mudança' },
    { text: 'Em 6 meses ele já tinha cortado o cabelo igual ao meu e copiado meu estilo.', caption: 'O espelho' },
    { text: 'Quando começou a sair com a minha melhor amiga, percebi que não era coincidência.', caption: 'A linha' },
  ],
  cta: 'Comenta o que faria',
  brand: 'channel os',
  accentColor: '#ff4500',
};

const TOPLIST_DEFAULT: TopListProps = {
  title: 'Top 5 conspirações que ficaram reais',
  hook: 'Top 5 conspirações que se provaram reais',
  beats: [
    { text: 'A CIA testou LSD em civis sem consentimento por décadas.', caption: 'MK-Ultra' },
    { text: 'Operação militar dos EUA pra simular ataques cubanos e justificar guerra.', caption: 'Northwoods' },
    { text: 'Big Tobacco sabia do câncer desde os anos 50 — e calou.', caption: 'O segredo do tabaco' },
    { text: 'NSA gravando ligações de aliados — confirmado por Snowden.', caption: 'PRISM' },
    { text: 'Petrolíferas previram o aquecimento global em 1977 e fundaram negacionismo.', caption: 'O memo Exxon' },
  ],
  cta: 'Qual te surpreendeu?',
  brand: 'channel os',
  accentColor: '#facc15',
  countdownDirection: 'desc',
};

const AUDIOGRAM_DEFAULT: AudiogramProps = {
  title: 'Por que dormimos pior quando estamos felizes?',
  hook: 'Por que dormimos pior quando estamos felizes?',
  speakerLabel: 'sleep clip · ep 12',
  beats: [
    { text: 'A dopamina alta atrapalha o ciclo REM mais do que cafeína.' },
    { text: 'Eventos positivos ativam memória declarativa — o cérebro repassa em loop.' },
    { text: 'A solução não é "relaxar", é DESCARREGAR — escrever 5 linhas antes de dormir.' },
  ],
  cta: 'Ouve até o fim',
  brand: 'channel os',
  accentColor: '#22d3a8',
  audioSrc: null,
};

export const RemotionRoot = () => (
  <>
    <Composition
      id="StoriesVertical"
      component={StoriesVertical}
      durationInFrames={30 * 30}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={STORIES_DEFAULT}
    />
    <Composition
      id="RedditStories"
      component={RedditStories}
      durationInFrames={30 * 38}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={REDDIT_DEFAULT}
    />
    <Composition
      id="TopList"
      component={TopList}
      durationInFrames={30 * 30}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={TOPLIST_DEFAULT}
    />
    <Composition
      id="Audiogram"
      component={Audiogram}
      durationInFrames={30 * 28}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={AUDIOGRAM_DEFAULT}
    />
  </>
);
