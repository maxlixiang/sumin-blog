import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const careerRoot = resolve(import.meta.dirname, "..");
const seedPath = resolve(careerRoot, "supabase/seeds/capability-model-v1.json");
const migrationPath = resolve(careerRoot, "supabase/migrations/202609230004_seed_capability_model_v1.sql");
const seed = JSON.parse(await readFile(seedPath, "utf8"));

const normalized = {
  ...seed,
  capabilities: seed.capabilities.map((capability, capabilityIndex) => ({
    ...capability,
    displayOrder: capabilityIndex + 1,
    levels: capability.levels.map((level) => ({
      ...level,
      displayOrder: level.level,
      milestones: level.milestones.map((milestone, milestoneIndex) => ({
        ...milestone,
        displayOrder: milestoneIndex + 1,
        completionCriteria: milestone.description,
        evidenceHint: "",
      })),
      evidenceRequirement: seed.requirements[capability.slug].find((requirement) => requirement.level === level.level),
    })),
  })),
};

for (const capability of normalized.capabilities) {
  if (capability.levels.length !== 5 || capability.levels.some((level) => level.milestones.length !== 5 || !level.evidenceRequirement)) {
    throw new Error(`${capability.slug} 的 V1 种子不完整`);
  }
}

const payload = JSON.stringify(normalized).replaceAll("'", "''");
const sql = `-- Generated from supabase/seeds/capability-model-v1.json. Do not hand-edit this file.\n-- Regenerate with: node scripts/generate-capability-model-seed.mjs\n\n` +
`do $$\n` +
`declare\n` +
`  seed jsonb := '${payload}'::jsonb;\n` +
`  model_id uuid;\n` +
`  capability_record record;\n` +
`  level_record record;\n` +
`  milestone_record record;\n` +
`  capability_uuid uuid;\n` +
`  level_definition_uuid uuid;\n` +
`begin\n` +
`  select id into model_id from public.capability_model_versions where owner_id is null and version = seed->>'version';\n` +
`  if model_id is null then\n` +
`    insert into public.capability_model_versions (owner_id, version, name, status, effective_from, notes)\n` +
`    values (null, seed->>'version', seed->>'name', 'active', current_date, 'User-approved Career OS Capability Model V1')\n` +
`    returning id into model_id;\n` +
`  end if;\n\n` +
`  for capability_record in\n` +
`    select value from jsonb_array_elements(seed->'capabilities')\n` +
`  loop\n` +
`    select id into capability_uuid from public.capabilities where slug = capability_record.value->>'slug';\n` +
`    if capability_uuid is null then raise exception 'Unknown capability slug: %', capability_record.value->>'slug'; end if;\n` +
`    for level_record in select value from jsonb_array_elements(capability_record.value->'levels') loop\n` +
`      insert into public.capability_level_definitions (model_version_id, capability_id, level, name, summary, standard, promotion_statement, reviewer_perspective, display_order)\n` +
`      values (model_id, capability_uuid, (level_record.value->>'level')::smallint, level_record.value->>'name', level_record.value->>'summary', level_record.value->>'standard', level_record.value->>'promotionStatement', level_record.value->>'reviewerPerspective', (level_record.value->>'displayOrder')::smallint)\n` +
`      on conflict (model_version_id, capability_id, level) do nothing\n` +
`      returning id into level_definition_uuid;\n\n` +
`      if level_definition_uuid is null then\n` +
`        select id into level_definition_uuid from public.capability_level_definitions where model_version_id = model_id and capability_id = capability_uuid and level = (level_record.value->>'level')::smallint;\n` +
`      end if;\n\n` +
`      for milestone_record in select value from jsonb_array_elements(level_record.value->'milestones') loop\n` +
`        insert into public.milestone_definitions (capability_level_definition_id, code, title, description, completion_criteria, evidence_hint, display_order)\n` +
`        values (level_definition_uuid, milestone_record.value->>'code', milestone_record.value->>'title', milestone_record.value->>'description', milestone_record.value->>'completionCriteria', milestone_record.value->>'evidenceHint', (milestone_record.value->>'displayOrder')::smallint)\n` +
`        on conflict (code) do nothing;\n` +
`      end loop;\n\n` +
`      insert into public.evidence_requirement_definitions (capability_level_definition_id, minimum_total, minimum_evidence_level, minimum_e1_plus, minimum_e2_plus, minimum_e3_plus, minimum_e4_plus, minimum_e5, minimum_distinct_scenarios, minimum_real_world_uses, special_requirements)\n` +
`      values (level_definition_uuid, (level_record.value->'evidenceRequirement'->>'minimumTotal')::smallint, null, (level_record.value->'evidenceRequirement'->>'minimumE2Plus')::smallint, (level_record.value->'evidenceRequirement'->>'minimumE2Plus')::smallint, (level_record.value->'evidenceRequirement'->>'minimumE3Plus')::smallint, (level_record.value->'evidenceRequirement'->>'minimumE4Plus')::smallint, (level_record.value->'evidenceRequirement'->>'minimumE5')::smallint, (level_record.value->'evidenceRequirement'->>'minimumDistinctScenarios')::smallint, (level_record.value->'evidenceRequirement'->>'minimumRealWorldUses')::smallint, coalesce(level_record.value->'evidenceRequirement'->'specialRequirements', '{}'::jsonb))\n` +
`      on conflict (capability_level_definition_id) do nothing;\n` +
`    end loop;\n` +
`  end loop;\n` +
`end $$;\n`;

await writeFile(migrationPath, sql, "utf8");
