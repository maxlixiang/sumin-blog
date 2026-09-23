import { PageHeader } from "@/components/page-header";
import Link from "next/link";
import { MilestoneProgressList } from "@/features/projects/milestone-progress-list";
import { requireUser } from "@/lib/auth/require-user";
import { CAPABILITY_LEVEL_DEFINITIONS, type CapabilityLevel } from "@/lib/constants/career";

function RequirementLine({ label, actual, required }: { label: string; actual: number; required: number }) {
  if (!required) return null;
  return <li className={actual >= required ? "readiness-line readiness-line--met" : "readiness-line"}><span>{actual >= required ? "已满足" : "待补充"}</span>{label}：{actual} / {required}</li>;
}

export default async function CapabilitiesPage() {
  const { supabase, userId } = await requireUser();
  const [capabilitiesResult, historyResult, definitionsResult, milestonesResult, progressResult, evidenceResult, evidenceCapabilitiesResult, requirementsResult] = await Promise.all([
    supabase.from("capabilities").select("id, slug, name, core_question, display_order").order("display_order"),
    supabase.from("capability_level_history").select("capability_id, to_level, effective_on, created_at").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("capability_level_definitions").select("id, capability_id, level, standard, promotion_statement"),
    supabase.from("milestone_definitions").select("*").eq("is_active", true).order("display_order"),
    supabase.from("user_milestone_progress").select("*"),
    supabase.from("evidence").select("id, evidence_level"),
    supabase.from("evidence_capabilities").select("evidence_id, capability_id"),
    supabase.from("evidence_requirement_definitions").select("*"),
  ]);
  if (capabilitiesResult.error || historyResult.error || definitionsResult.error || milestonesResult.error || progressResult.error || evidenceResult.error || evidenceCapabilitiesResult.error || requirementsResult.error) throw new Error("无法读取能力发展状态");
  const latest = new Map<string, { level: CapabilityLevel; date: string }>();
  for (const row of historyResult.data ?? []) if (!latest.has(row.capability_id)) latest.set(row.capability_id, { level: row.to_level as CapabilityLevel, date: row.effective_on });
  const definitions = new Map((definitionsResult.data ?? []).map((row) => [`${row.capability_id}:${row.level}`, row]));
  const definitionIdByCapabilityLevel = new Map((definitionsResult.data ?? []).map((row) => [`${row.capability_id}:${row.level}`, row.id]));
  const progressByMilestone = Object.fromEntries((progressResult.data ?? []).map((row) => [row.milestone_definition_id, row]));
  const requirementByDefinitionId = new Map((requirementsResult.data ?? []).map((row) => [row.capability_level_definition_id, row]));
  const evidenceLevelById = new Map((evidenceResult.data ?? []).map((row) => [row.id, row.evidence_level]));
  const evidenceLevelsByCapability = new Map<string, number[]>();
  for (const link of evidenceCapabilitiesResult.data ?? []) {
    const level = evidenceLevelById.get(link.evidence_id);
    if (level !== undefined) evidenceLevelsByCapability.set(link.capability_id, [...(evidenceLevelsByCapability.get(link.capability_id) ?? []), level]);
  }

  return <div className="daily-page">
    <PageHeader title="能力发展" description="所有能力从 L1 开始；晋级需要完成必修里程碑、满足证据门槛，并经正式评估。" actions={<><Link className="button button--secondary" href="/responsibility">责任成长</Link><Link className="button button--primary" href="/projects">发展项目</Link></>} actionsMobileVisible />
    <div className="capability-grid">
      {(capabilitiesResult.data ?? []).map((capability) => {
        const current = latest.get(capability.id) ?? { level: 1 as CapabilityLevel, date: "" };
        const definition = definitions.get(`${capability.id}:${current.level}`);
        const targetLevel = current.level < 5 ? (current.level + 1) as CapabilityLevel : null;
        const targetDefinitionId = targetLevel ? definitionIdByCapabilityLevel.get(`${capability.id}:${targetLevel}`) : undefined;
        const targetMilestones = targetDefinitionId ? (milestonesResult.data ?? []).filter((milestone) => milestone.capability_level_definition_id === targetDefinitionId) : [];
        const completedTargetMilestones = targetMilestones.filter((milestone) => progressByMilestone[milestone.id]?.status === "completed").length;
        const requirements = targetDefinitionId ? requirementByDefinitionId.get(targetDefinitionId) : undefined;
        const evidenceLevels = evidenceLevelsByCapability.get(capability.id) ?? [];
        const evidenceAtOrAbove = (level: number) => evidenceLevels.filter((evidenceLevel) => evidenceLevel >= level).length;
        const automaticRequirementsMet = Boolean(requirements && completedTargetMilestones === targetMilestones.length && evidenceLevels.length >= requirements.minimum_total && evidenceAtOrAbove(1) >= requirements.minimum_e1_plus && evidenceAtOrAbove(2) >= requirements.minimum_e2_plus && evidenceAtOrAbove(3) >= requirements.minimum_e3_plus && evidenceAtOrAbove(4) >= requirements.minimum_e4_plus && evidenceAtOrAbove(5) >= requirements.minimum_e5);
        return <article className="capability-card" key={capability.id}>
          <div className="capability-card__header"><div><span className="capability-card__initial">{capability.name[0]}</span><div><h2>{capability.name}</h2><p>L{current.level} · {CAPABILITY_LEVEL_DEFINITIONS[current.level]}</p></div></div></div>
          <p>{capability.core_question}</p>
          <div className="capability-card__requirement"><span>当前标准</span><p>{definition?.standard ?? "正在载入模型标准。"}</p></div>
          <div className="capability-card__requirement"><span>下一步</span><p>{current.level === 5 ? "持续验证组织化成熟度。" : definition?.promotion_statement ?? "完成当前等级的里程碑与证据门槛。"}</p></div>
          <details className="capability-card__milestones"><summary>查看当前等级里程碑</summary><MilestoneProgressList milestones={(milestonesResult.data ?? []).filter((milestone) => milestone.capability_level_definition_id === definitionIdByCapabilityLevel.get(`${capability.id}:${current.level}`))} progressByMilestone={progressByMilestone} /></details>
          {targetLevel && requirements ? <details className="capability-card__readiness"><summary>查看 L{targetLevel} 晋级准备度</summary><div className="readiness-panel"><p className={automaticRequirementsMet ? "readiness-status readiness-status--ready" : "readiness-status"}>{automaticRequirementsMet ? "基础条件已满足，仍需人工核对并正式申请。" : "尚未具备申请条件：请优先补足以下项目。"}</p><ul><RequirementLine label="必修里程碑" actual={completedTargetMilestones} required={targetMilestones.length} /><RequirementLine label="关联成长证据" actual={evidenceLevels.length} required={requirements.minimum_total} /><RequirementLine label="E1+ 证据" actual={evidenceAtOrAbove(1)} required={requirements.minimum_e1_plus} /><RequirementLine label="E2+ 证据" actual={evidenceAtOrAbove(2)} required={requirements.minimum_e2_plus} /><RequirementLine label="E3+ 证据" actual={evidenceAtOrAbove(3)} required={requirements.minimum_e3_plus} /><RequirementLine label="E4+ 证据" actual={evidenceAtOrAbove(4)} required={requirements.minimum_e4_plus} /><RequirementLine label="E5 证据" actual={evidenceAtOrAbove(5)} required={requirements.minimum_e5} /></ul>{requirements.minimum_distinct_scenarios || requirements.minimum_real_world_uses ? <p className="readiness-note">还需人工核对：不同场景与真实业务应用要求。</p> : null}{automaticRequirementsMet ? <Link className="button button--primary" href={`/capabilities/${capability.slug}/promotion`}>进入晋级申请</Link> : null}</div></details> : null}
        </article>;
      })}
    </div>
  </div>;
}
