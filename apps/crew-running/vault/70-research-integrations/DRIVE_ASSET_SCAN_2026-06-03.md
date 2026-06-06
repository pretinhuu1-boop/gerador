# Google Drive Asset Scan - 2026-06-03

Scope: first-pass read-only scan for reusable image/video-generation assets for
`apps/crew-running`.

## High-Value Findings

### Google AI Studio

Folder:
https://drive.google.com/drive/folders/1cyS1a4bXUvRk9wkzdItPe--OeIjblfjo

Why it matters:
- Contains real image files from older generation sessions, especially October
  and November 2025.
- Contains Google AI Studio prompts and applet zip objects that preserve creative
  workflows and prompt history.

Observed useful clusters:
- 2025-10-18: `Favela Funk Night: Bikes, Beats`, `Morning After Mansion Party`,
  `Luxurious Bedroom, Calm Monday Morning`, plus repeated `fr1.jpg`,
  `fr2.jpg`, `fr3.jpg` frame/reference sets.
- 2025-10-29: `Add Clothes To Person`, `Branch of Add Clothes To Person`,
  `outfit.jpg`, repeated `IMG_8537.png` through `IMG_8540.png`, and generated
  image / WhatsApp reference sets.
- 2025-10-30 to 2025-11-01: flyer/image generation material, including
  `Gerador de Flyer de Show com IA`, `Transform 16:9`, `Aumente as Laterais`,
  `flyer-imagem (8).png`, and `Image November 01, 2025` files.
- 2025-12-16: `image.png` PNG assets. One sampled file had a 984x984 PNG header.

Notes:
- Direct Drive search by global image/video MIME was unreliable in the connector,
  but direct folder listing exposed the images.
- No raw `.mp4` files were exposed in the first pass. Video material appears more
  often as prompts/docs/applets than as downloadable video files.

### CrewRunning Drive Docs

Primary doc:
https://drive.google.com/file/d/11FoO_PMRCVL0NZnefhgJTgvBJ_nyKSzV/view

Related docs found by Drive search:
- `CrewRunning_PLANO_FINAL.md`
- `CrewRunning_PLANO_FINAL_EXECUCAO.md`
- `CrewRunning_RESUMO_EXECUTIVO.md`
- `CrewRunning_PLANO_MESTRE_MVP.md`

Useful claim from the plan:
- 5 crews with complete visual identity.
- 150+ asset files.
- 35+ audio files.
- 16 wardrobe items.

Local repo check:
- `apps/crew-running/public/crews/` exists with 5 crew folders.
- Local crew asset count observed: 101 files under `public/crews`.
- `public/audio/` and `public/wardrobe/` are already populated.
- `public/wardrobe/hair/` exists on disk, but creator contract says `hair` is
  not a valid generation slot.

### MAX HABILIADADE Vault Export

Folder:
https://drive.google.com/drive/folders/1USsMPQg5ivpDdPE1jc3q9y_CEQKZOCfW

Zip:
https://drive.google.com/file/d/1DegNEWi1xChuFhMx7texDcJfHFzNWQty/view

Why it matters:
- Large vault/project export with many product and creative folders.
- Contains likely research and pipeline material, not a simple media gallery.

Candidate subfolders for deeper scan:
- `gerador`
- `gerador-agencia`
- `ArtistMuseFlow`
- `Lumotionapp`
- `CrossfitAnaliaFranco`
- `Axial-GG`
- `lumem`

### Video/Pipeline Material

Found:
- `veo-video-generation` folder:
  https://drive.google.com/drive/folders/1WgYwFmVmL2vLo_n7UiZxCAolQP7yhjxJ
- `veo-automation` folder:
  https://drive.google.com/drive/folders/1DQlBLNDwL75DD8xAFZC5Nk2aeiFszEnV
- `VEO 3 Vitalicio` Google Doc:
  https://docs.google.com/document/d/1uqiMVTtjsRdVSBKuGJWrOfVsuUN7K9yWKetSUnt4uRM
- `Formula de prompt JSON para Google VEO 3` Google Doc:
  https://docs.google.com/document/d/1kvLfwLx6TYLu-zYydStGcYVuZWyKWjT4cjo0KZyWr8E
- `Tutorial Completo: Como Criar Comerciais Profissionais no Google VEO3`
  Google Doc:
  https://docs.google.com/document/d/1nSCQSzl5gkYpycH2EFMtCI-O2X2Ykk633awBX9uvAaM

Observed state:
- These are valuable for prompt logic and pipeline references.
- They are not confirmed raw video-asset sources yet.

## Import Rules For Crew Running

Do not bulk-import assets into generation inputs.

Creator contract constraints:
- Runner generation must use only `public/crews/{selectedCrewSlug}/` through
  `CrewRenderContext`.
- Do not use `public/styles/*` as generation input.
- Do not restore public style selection.
- Valid wardrobe slots are only `top`, `bottom`, `shoes`, and `accessory`.
- Do not use `hair` as a generation slot.
- Never copy an exact real face, hair, clothing, marks, or recognizable identity.

Recommended intake flow:
1. Curate Drive candidates into a temporary review manifest.
2. Classify each candidate as `crew_identity`, `wardrobe`, `background`,
   `ui_texture`, `prompt_reference`, or `reject`.
3. Only move approved crew identity assets into `public/crews/{crewSlug}/`.
4. Keep video/prompt docs in `vault/` unless they become concrete runtime assets.
5. Run `npm run validate` from `apps/crew-running` before finishing creator work.
