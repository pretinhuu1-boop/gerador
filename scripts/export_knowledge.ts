/**
 * Export legacy creative knowledge from `data/*.ts` to `knowledge_seed.json`.
 *
 * Run: `npx tsx scripts/export_knowledge.ts`
 *
 * The output JSON is consumed by `hermes-gateway/scripts/seed_knowledge.py`
 * which embeds each record and bulk-inserts into Supabase `hermes_knowledge`.
 *
 * Knowledge kinds:
 *   - doc                 long markdown guides (DRC, CME, CLAFE, ...)
 *   - cinema_genre        CINEMA_GENRES
 *   - style_preset        cinema_style_library (ammar/trap/funk)
 *   - environment_preset  environment_library
 *   - narrative_preset    narrative_library
 *   - lens_preset         lenses_and_composition_library
 *   - b_roll_scenario     b_roll_library
 *   - vibe_preset         vibe_presets
 *   - context_modifier    context_modifiers
 *   - texture_preset      texture_library
 *   - prompt              prompt_library + bananaPromptLibrary
 *   - vfx_preset          VFX_EXPLOSION_PRESETS
 *   - meta_prompt         system prompts (VFX_SUPERVISOR, ASSISTANT_DIRECTOR, MASTER_FILMMAKER)
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

interface KnowledgeRecord {
  kind: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  metadata: Record<string, unknown>;
}

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const records: KnowledgeRecord[] = [];

function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80);
}

function summarize(text: string, maxLen = 280): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > maxLen ? clean.slice(0, maxLen - 1) + '…' : clean;
}

// ─── Long markdown docs (default exports) ────────────────────────────────────
const docs: Array<{ slug: string; title: string; module: string }> = [
  { slug: 'drc_v1', title: 'Documento de Referência Criativa v1', module: '../data/DRC_V1_0' },
  { slug: 'cme_v1', title: 'Cinematic Motion Engine (CME) — Comportamento da câmera', module: '../data/CME_V1_0' },
  { slug: 'clafe_v1', title: 'Cinematic Light & Atmos FX Engine (CLAFE)', module: '../data/CLAFE_V1_0' },
  { slug: 'cime_v1', title: 'Cinematic Internal Motion Engine (CIME)', module: '../data/CIME_V1_0' },
  { slug: 'rsse_v1', title: 'Real Surface Simulation Engine (RSSE)', module: '../data/RSSE_V1_0' },
  { slug: 'wardrobe_engine_v1', title: 'Wardrobe Engine — Figurino & Estética', module: '../data/WardrobeEngine_V1_0' },
  { slug: 'image_science_4k_v1', title: 'A Ciência da Imagem 4K', module: '../data/ImageScience_4K_V1_0' },
  { slug: 'actor_behavior_library', title: 'Cinematic Performance Engine — Comportamento do ator', module: '../data/actor_behavior_library' },
  { slug: 'doc_010_micro_scenes', title: 'Micro-Cenas Loopáveis com IA', module: '../data/DOC_010' },
  { slug: 'trap_style_guide_v1', title: 'Como filmar no estilo TRAP (2024–2025)', module: '../data/TrapStyleGuide_v1' },
];

for (const d of docs) {
  const mod = await import(d.module);
  const body: string =
    typeof mod.default === 'string'
      ? mod.default
      : typeof mod.TRAP_STYLE_GUIDE === 'string'
        ? mod.TRAP_STYLE_GUIDE
        : '';
  if (!body) {
    console.warn(`[warn] empty doc body for ${d.slug}`);
    continue;
  }
  records.push({
    kind: 'doc',
    slug: d.slug,
    title: d.title,
    summary: summarize(body),
    content: body.trim(),
    metadata: { source_file: `data/${d.module.split('/').pop()}.ts` },
  });
}

// ─── VFX (system prompt + presets) ───────────────────────────────────────────
{
  const mod = await import('../data/VFX_Explosions_v1');
  records.push({
    kind: 'meta_prompt',
    slug: 'vfx_supervisor_system_prompt',
    title: 'VFX Supervisor — System Prompt',
    summary: 'Sistema pra agente especializado em explosões, partículas e fumaça realista (Veo 3.1 + similares).',
    content: mod.VFX_SUPERVISOR_SYSTEM_PROMPT,
    metadata: { source_file: 'data/VFX_Explosions_v1.ts' },
  });
  for (const preset of mod.VFX_EXPLOSION_PRESETS ?? []) {
    const slug = slugify(preset.nome ?? preset.id ?? JSON.stringify(preset).slice(0, 40));
    records.push({
      kind: 'vfx_preset',
      slug,
      title: preset.nome ?? slug,
      summary: summarize(preset.descricao ?? preset.logline ?? JSON.stringify(preset)),
      content: JSON.stringify(preset, null, 2),
      metadata: { source_file: 'data/VFX_Explosions_v1.ts', preset },
    });
  }
}

// ─── Cinema genres + canonical knowledge base ────────────────────────────────
{
  const mod = await import('../data/cinema_data');
  for (const g of mod.CINEMA_GENRES ?? []) {
    records.push({
      kind: 'cinema_genre',
      slug: g.id,
      title: g.name,
      summary: g.description,
      content: `${g.name}\n\n${g.description}`,
      metadata: { source_file: 'data/cinema_data.ts', pcc_code: g.pccCode ?? null },
    });
  }
  if (typeof mod.KNOWLEDGE_BASE_CINEMA === 'string') {
    records.push({
      kind: 'doc',
      slug: 'knowledge_base_cinema',
      title: 'Knowledge Base — Cinema (legacy)',
      summary: summarize(mod.KNOWLEDGE_BASE_CINEMA),
      content: mod.KNOWLEDGE_BASE_CINEMA.trim(),
      metadata: { source_file: 'data/cinema_data.ts' },
    });
  }
}

// ─── Style presets ───────────────────────────────────────────────────────────
{
  const mod = await import('../data/cinema_style_library');
  const presets = [mod.ammarStylePreset, mod.trapGritUrbanoPreset, mod.funkPeriferiaSpRawPreset].filter(Boolean);
  for (const preset of presets) {
    const slug = slugify(preset.id ?? preset.nome);
    records.push({
      kind: 'style_preset',
      slug,
      title: preset.nome ?? preset.id,
      summary: preset.logline ?? summarize(JSON.stringify(preset)),
      content: JSON.stringify(preset, null, 2),
      metadata: { source_file: 'data/cinema_style_library.ts', categoria: preset.categoria, preset },
    });
  }
}

// ─── Environment presets ─────────────────────────────────────────────────────
{
  const mod = await import('../data/environment_library');
  for (const preset of mod.environmentLibrary ?? []) {
    records.push({
      kind: 'environment_preset',
      slug: slugify(preset.id ?? preset.nome),
      title: preset.nome,
      summary: preset.descricao ?? summarize(JSON.stringify(preset)),
      content: JSON.stringify(preset, null, 2),
      metadata: { source_file: 'data/environment_library.ts', categoria: preset.categoria, preset },
    });
  }
}

// ─── Narrative presets ───────────────────────────────────────────────────────
{
  const mod = await import('../data/narrative_library');
  for (const preset of mod.narrativeLibrary ?? []) {
    const slug = slugify(preset.id ?? `${preset.tema_central}_${preset.subtema}`);
    const summary = `${preset.tema_central} — ${preset.subtema}. ${preset.emocao_primaria}/${preset.emocao_secundaria}.`;
    records.push({
      kind: 'narrative_preset',
      slug,
      title: `${preset.tema_central}: ${preset.subtema}`,
      summary,
      content: JSON.stringify(preset, null, 2),
      metadata: { source_file: 'data/narrative_library.ts', preset },
    });
  }
}

// ─── Lens & composition presets ──────────────────────────────────────────────
{
  const mod = await import('../data/lenses_and_composition_library');
  for (const preset of mod.lensCompositionLibrary ?? []) {
    const slug = slugify(preset.id ?? preset.lente?.distancia_focal ?? JSON.stringify(preset).slice(0, 40));
    const focal = preset.lente?.distancia_focal ?? '';
    records.push({
      kind: 'lens_preset',
      slug,
      title: preset.nome ?? `Lente ${focal}`,
      summary: summarize(preset.descricao ?? `Lente ${focal} — ${JSON.stringify(preset.lente?.comportamento ?? {})}`),
      content: JSON.stringify(preset, null, 2),
      metadata: { source_file: 'data/lenses_and_composition_library.ts', focal, preset },
    });
  }
}

// ─── B-roll scenarios ────────────────────────────────────────────────────────
{
  const mod = await import('../data/b_roll_library');
  for (const cat of mod.bRollLibrary ?? []) {
    for (const item of cat.scenarios ?? cat.items ?? []) {
      records.push({
        kind: 'b_roll_scenario',
        slug: slugify(`${cat.name ?? cat.id ?? 'cat'}_${item.id ?? item.description?.slice(0, 30)}`),
        title: item.title ?? `B-roll #${item.id}`,
        summary: summarize(item.description ?? ''),
        content: item.description ?? JSON.stringify(item),
        metadata: { source_file: 'data/b_roll_library.ts', category: cat.name ?? cat.id, item },
      });
    }
  }
}

// ─── Vibe presets ────────────────────────────────────────────────────────────
{
  const mod = await import('../data/vibe_presets');
  for (const preset of mod.vibePresets ?? []) {
    const slug = slugify(preset.id ?? preset.name ?? preset.nome);
    records.push({
      kind: 'vibe_preset',
      slug,
      title: preset.name ?? preset.nome ?? slug,
      summary: summarize(preset.description ?? preset.descricao ?? JSON.stringify(preset)),
      content: JSON.stringify(preset, null, 2),
      metadata: { source_file: 'data/vibe_presets.ts', preset },
    });
  }
}

// ─── Context modifiers ───────────────────────────────────────────────────────
{
  const mod = await import('../data/context_modifiers');
  for (const cat of mod.contextModifiersLibrary ?? []) {
    for (const mod_ of cat.modifiers ?? cat.items ?? []) {
      records.push({
        kind: 'context_modifier',
        slug: slugify(`${cat.name ?? cat.code ?? 'cat'}_${mod_.code ?? mod_.name}`),
        title: mod_.name,
        summary: mod_.description ?? '',
        content: `${mod_.name}\n\n${mod_.description ?? ''}\n\nCode: ${mod_.code ?? '-'}`,
        metadata: { source_file: 'data/context_modifiers.ts', category: cat.name ?? cat.code, code: mod_.code },
      });
    }
  }
}

// ─── Texture presets ─────────────────────────────────────────────────────────
{
  const mod = await import('../data/texture_library');
  for (const preset of mod.textureLibrary ?? []) {
    records.push({
      kind: 'texture_preset',
      slug: slugify(preset.id ?? preset.nome ?? preset.name),
      title: preset.nome ?? preset.name ?? preset.id,
      summary: summarize(preset.descricao ?? preset.description ?? JSON.stringify(preset)),
      content: JSON.stringify(preset, null, 2),
      metadata: { source_file: 'data/texture_library.ts', preset },
    });
  }
}

// ─── Prompt library (versioned + banana) ─────────────────────────────────────
{
  const mod = await import('../data/prompt_library');
  for (const ver of mod.promptLibrary ?? []) {
    for (const cat of ver.categories ?? []) {
      for (const p of cat.items ?? []) {
        records.push({
          kind: 'prompt',
          slug: slugify(`pv${ver.version}_${cat.name}_${p.id}`),
          title: `${cat.name} #${p.id}`,
          summary: summarize(p.text),
          content: p.text,
          metadata: {
            source_file: 'data/prompt_library.ts',
            library_version: ver.version,
            library_description: ver.description,
            category: cat.name,
            prompt_id: p.id,
          },
        });
      }
    }
  }
  for (const p of mod.bananaPromptLibrary ?? []) {
    records.push({
      kind: 'prompt',
      slug: slugify(`banana_${p.id ?? p.title ?? JSON.stringify(p).slice(0, 30)}`),
      title: p.title ?? `Banana #${p.id}`,
      summary: summarize(p.text ?? p.description ?? JSON.stringify(p)),
      content: p.text ?? JSON.stringify(p, null, 2),
      metadata: { source_file: 'data/prompt_library.ts', banana: true, item: p },
    });
  }
}

// ─── Write out ───────────────────────────────────────────────────────────────
const seenSlugs = new Map<string, number>();
for (const r of records) {
  const key = `${r.kind}:${r.slug}`;
  const n = (seenSlugs.get(key) ?? 0) + 1;
  seenSlugs.set(key, n);
  if (n > 1) r.slug = `${r.slug}_${n}`;
}

const out = join(root, 'hermes-gateway', 'seeds', 'knowledge_seed.json');
writeFileSync(out, JSON.stringify({ version: 1, count: records.length, records }, null, 2));

const byKind = records.reduce<Record<string, number>>((acc, r) => {
  acc[r.kind] = (acc[r.kind] ?? 0) + 1;
  return acc;
}, {});

console.log(`wrote ${records.length} records → ${out}`);
console.log(byKind);
