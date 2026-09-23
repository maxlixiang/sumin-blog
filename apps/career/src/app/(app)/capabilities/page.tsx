import { PageHeader } from "@/components/page-header";
import Link from "next/link";
import { MilestoneProgressList } from "@/features/projects/milestone-progress-list";
import { requireUser } from "@/lib/auth/require-user";
import { CAPABILITY_LEVEL_DEFINITIONS, type CapabilityLevel } from "@/lib/constants/career";

export default async function CapabilitiesPage() {
  const { supabase, userId } = await requireUser();
  const [capabilitiesResult, historyResult, definitionsResult, milestonesResult, progressResult] = await Promise.all([
    supabase.from("capabilities").select("id, slug, name, core_question, display_order").order("display_order"),
    supabase.from("capability_level_history").select("capability_id, to_level, effective_on, created_at").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("capability_level_definitions").select("id, capability_id, level, standard, promotion_statement"),
    supabase.from("milestone_definitions").select("*").eq("is_active", true).order("display_order"),
    supabase.from("user_milestone_progress").select("*"),
  ]);
  if (capabilitiesResult.error || historyResult.error || definitionsResult.error || milestonesResult.error || progressResult.error) throw new Error("无法读取能力发展状态");
  const latest = new Map<string, { level: CapabilityLevel; date: string }>();
  for (const row of historyResult.data ?? []) if (!latest.has(row.capability_id)) latest.set(row.capability_id, { level: row.to_level as CapabilityLevel, date: row.effective_on });
  const definitions = new Map((definitionsResult.data ?? []).map((row) => [`${row.capability_id}:${row.level}`, row]));
  const definitionIdByCapabilityLevel = new Map((definitionsResult.data ?? []).map((row) => [`${row.capability_id}:${row.level}`, row.id]));
  const progressByMilestone = Object.fromEntries((progressResult.data ?? []).map((row) => [row.milestone_definition_id, row]));

  return <div className="daily-page">
    <PageHeader title="能力发展" description="所有能力从 L1 开始；晋级需要完成必修里程碑、满足证据门槛，并经正式评估。" actions={<Link className="button button--primary" href="/projects">发展项目</Link>} />
    <div className="capability-grid">
      {(capabilitiesResult.data ?? []).map((capability) => {
        const current = latest.get(capability.id) ?? { level: 1 as CapabilityLevel, date: "" };
        const definition = definitions.get(`${capability.id}:${current.level}`);
        return <article className="capability-card" key={capability.id}>
          <div className="capability-card__header"><div><span className="capability-card__initial">{capability.name[0]}</span><div><h2>{capability.name}</h2><p>L{current.level} · {CAPABILITY_LEVEL_DEFINITIONS[current.level]}</p></div></div></div>
          <p>{capability.core_question}</p>
          <div className="capability-card__requirement"><span>当前标准</span><p>{definition?.standard ?? "正在载入模型标准。"}</p></div>
          <div className="capability-card__requirement"><span>下一步</span><p>{current.level === 5 ? "持续验证组织化成熟度。" : definition?.promotion_statement ?? "完成当前等级的里程碑与证据门槛。"}</p></div>
          <details className="capability-card__milestones"><summary>查看当前等级里程碑</summary><MilestoneProgressList milestones={(milestonesResult.data ?? []).filter((milestone) => milestone.capability_level_definition_id === definitionIdByCapabilityLevel.get(`${capability.id}:${current.level}`))} progressByMilestone={progressByMilestone} /></details>
        </article>;
      })}
    </div>
  </div>;
}
