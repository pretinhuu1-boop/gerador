export type CharacterStyle = {
  id: string;
  label: string;
  description: string;
  promptStyle: string;
};

export const STYLES: CharacterStyle[] = [
  {
    id: 'street_comic',
    label: 'Street Comic',
    description: 'Quadrinhos urbanos, contornos pesados',
    promptStyle:
      'hand-drawn comic-book illustration, bold black ink outlines, gritty paper texture background in dark charcoal, vibrant teal and orange palette, confident hands-on-hips pose, graffiti tags scattered subtly in background, The Crew Running aesthetic',
  },
  {
    id: 'graffiti_poster',
    label: 'Graffiti Poster',
    description: 'Pôster de cartaz, traço bruto',
    promptStyle:
      'urban poster art style, screen-printed look with halftone shading, distressed warm beige background, orange and white accents, mid-stride running pose, paint-splatter accents, street-poster aesthetic',
  },
  {
    id: 'anime_runner',
    label: 'Anime Runner',
    description: 'Anime esportivo, linhas limpas',
    promptStyle:
      'modern anime sports illustration, clean black linework, cel-shaded coloring, dynamic running pose with motion lines, bright energetic palette, soft city-at-dusk gradient background',
  },
  {
    id: 'mascot_bold',
    label: 'Bold Mascot',
    description: 'Mascote chibi com atitude',
    promptStyle:
      'bold mascot illustration, slightly chibi proportions with oversized head, thick outlines, flat saturated colors, dark teal background with subtle grid pattern, confident smirk and crossed arms pose',
  },
];
