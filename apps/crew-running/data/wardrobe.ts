export type WardrobeItem = {
  id: string;
  label: string;
  prompt: string;
  iconUrl?: string;
};
export type SlotKey = 'hair' | 'top' | 'bottom' | 'shoes';

export const WARDROBE: Record<SlotKey, WardrobeItem[]> = {
  hair: [
    { id: 'hair_pony_teal',   label: 'Rabo Teal',     prompt: 'long ponytail dyed teal blue with side-shaved fade', iconUrl: '/wardrobe/hair/hair_pony_teal.png' },
    { id: 'hair_dreads',      label: 'Dreads',        prompt: 'medium-length dark dreadlocks tied back', iconUrl: '/wardrobe/hair/hair_dreads.png' },
    { id: 'hair_cap_curls',   label: 'Boné + Cachos', prompt: 'red snapback cap worn backwards over short curly hair', iconUrl: '/wardrobe/hair/hair_cap_curls.png' },
    { id: 'hair_buzz_blonde', label: 'Buzz Loiro',    prompt: 'short buzz-cut with bleached blonde top', iconUrl: '/wardrobe/hair/hair_buzz_blonde.png' },
  ],
  top: [
    { id: 'top_hoodie_graf',  label: 'Hoodie Graffiti', prompt: 'cropped hoodie with orange graffiti tag print over dark navy fabric', iconUrl: '/wardrobe/top/top_hoodie_graf.png' },
    { id: 'top_tank_black',   label: 'Regata Preta',    prompt: 'fitted black athletic tank top with white trim', iconUrl: '/wardrobe/top/top_tank_black.png' },
    { id: 'top_hoodie_red',   label: 'Hoodie Vermelho', prompt: 'oversized red running hoodie with white drawstrings', iconUrl: '/wardrobe/top/top_hoodie_red.png' },
    { id: 'top_jersey_teal',  label: 'Jersey Teal',     prompt: 'sleeveless teal running jersey with bold crew logo', iconUrl: '/wardrobe/top/top_jersey_teal.png' },
  ],
  bottom: [
    { id: 'bot_shorts_maroon',label: 'Short Vinho',   prompt: 'short maroon running shorts with white side stripe', iconUrl: '/wardrobe/bottom/bot_shorts_maroon.png' },
    { id: 'bot_leggings_blk', label: 'Legging Preta', prompt: 'black athletic leggings with subtle teal accent line', iconUrl: '/wardrobe/bottom/bot_leggings_blk.png' },
    { id: 'bot_jogger_grey',  label: 'Jogger Cinza',  prompt: 'loose grey joggers with white side stripes, cuffed ankles', iconUrl: '/wardrobe/bottom/bot_jogger_grey.png' },
    { id: 'bot_shorts_teal',  label: 'Short Teal',    prompt: 'teal running shorts with white piping', iconUrl: '/wardrobe/bottom/bot_shorts_teal.png' },
  ],
  shoes: [
    { id: 'sho_runners_teal', label: 'Tênis Teal',      prompt: 'chunky teal running sneakers with white sole', iconUrl: '/wardrobe/shoes/sho_runners_teal.png' },
    { id: 'sho_sneak_red',    label: 'Sneaker Vermelho',prompt: 'red low-top sneakers with white laces', iconUrl: '/wardrobe/shoes/sho_sneak_red.png' },
    { id: 'sho_sneak_white',  label: 'Sneaker Branco',  prompt: 'clean white low-top sneakers with orange accents', iconUrl: '/wardrobe/shoes/sho_sneak_white.png' },
    { id: 'sho_runners_blk',  label: 'Runners Preto',   prompt: 'all-black trail running shoes with reflective details', iconUrl: '/wardrobe/shoes/sho_runners_blk.png' },
  ],
};

export const SLOT_LABELS: Record<SlotKey, string> = {
  hair: 'Hairstyle',
  top: 'Tops',
  bottom: 'Legs',
  shoes: 'Shoes',
};
