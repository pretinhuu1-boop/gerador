export type WardrobeItem = { id: string; label: string; prompt: string };
export type SlotKey = 'hair' | 'top' | 'bottom' | 'shoes';

export const WARDROBE: Record<SlotKey, WardrobeItem[]> = {
  hair: [
    { id: 'hair_pony_teal',   label: 'Rabo Teal',    prompt: 'long ponytail dyed teal blue with side-shaved fade' },
    { id: 'hair_dreads',      label: 'Dreads',       prompt: 'medium-length dark dreadlocks tied back' },
    { id: 'hair_cap_curls',   label: 'Boné + Cachos', prompt: 'red snapback cap worn backwards over short curly hair' },
    { id: 'hair_buzz_blonde', label: 'Buzz Loiro',   prompt: 'short buzz-cut with bleached blonde top' },
  ],
  top: [
    { id: 'top_hoodie_graf',  label: 'Hoodie Graffiti', prompt: 'cropped hoodie with orange graffiti tag print over dark navy fabric' },
    { id: 'top_tank_black',   label: 'Regata Preta',    prompt: 'fitted black athletic tank top with white trim' },
    { id: 'top_hoodie_red',   label: 'Hoodie Vermelho', prompt: 'oversized red running hoodie with white drawstrings' },
    { id: 'top_jersey_teal',  label: 'Jersey Teal',     prompt: 'sleeveless teal running jersey with bold crew logo' },
  ],
  bottom: [
    { id: 'bot_shorts_maroon',label: 'Short Vinho',    prompt: 'short maroon running shorts with white side stripe' },
    { id: 'bot_leggings_blk', label: 'Legging Preta',  prompt: 'black athletic leggings with subtle teal accent line' },
    { id: 'bot_jogger_grey',  label: 'Jogger Cinza',   prompt: 'loose grey joggers with white side stripes, cuffed ankles' },
    { id: 'bot_shorts_teal',  label: 'Short Teal',     prompt: 'teal running shorts with white piping' },
  ],
  shoes: [
    { id: 'sho_runners_teal', label: 'Tênis Teal',     prompt: 'chunky teal running sneakers with white sole' },
    { id: 'sho_sneak_red',    label: 'Sneaker Vermelho', prompt: 'red low-top sneakers with white laces' },
    { id: 'sho_sneak_white',  label: 'Sneaker Branco',  prompt: 'clean white low-top sneakers with orange accents' },
    { id: 'sho_runners_blk',  label: 'Runners Preto',   prompt: 'all-black trail running shoes with reflective details' },
  ],
};

export const SLOT_LABELS: Record<SlotKey, string> = {
  hair: 'Hairstyle',
  top: 'Top',
  bottom: 'Bottom',
  shoes: 'Shoes',
};
