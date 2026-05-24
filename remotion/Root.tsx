import { Composition } from 'remotion';
import { StoriesVertical, type StoriesVerticalProps } from './compositions/StoriesVertical';

const DEFAULT_PROPS: StoriesVerticalProps = {
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

export const RemotionRoot = () => (
  <>
    <Composition
      id="StoriesVertical"
      component={StoriesVertical}
      durationInFrames={30 * 30}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={DEFAULT_PROPS}
    />
  </>
);
