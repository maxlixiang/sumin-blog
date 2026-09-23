import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { PromotionForm } from "@/features/promotions/promotion-form";
import { requireUser } from "@/lib/auth/require-user";

export default async function PromotionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const { supabase, userId } = await requireUser();
  const capability = await supabase.from("capabilities").select("id, name").eq("slug", slug).maybeSingle(); if (capability.error || !capability.data) notFound();
  const [history, application, definition, requirements, milestones, progress, evidence, evidenceLinks] = await Promise.all([
    supabase.from("capability_level_history").select("to_level, model_version_id").eq("user_id", userId).eq("capability_id", capability.data.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("promotion_applications").select("id, status").eq("user_id", userId).eq("capability_id", capability.data.id).in("status", ["under_review", "review_completed"]).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("capability_level_definitions").select("id, level, model_version_id").eq("capability_id", capability.data.id),
    supabase.from("evidence_requirement_definitions").select("*"),
    supabase.from("milestone_definitions").select("id, capability_level_definition_id"),
    supabase.from("user_milestone_progress").select("milestone_definition_id, status"),
    supabase.from("evidence").select("id, evidence_level"),
    supabase.from("evidence_capabilities").select("evidence_id").eq("capability_id", capability.data.id),
  ]);
  if (history.error || application.error || definition.error || requirements.error || milestones.error || progress.error || evidence.error || evidenceLinks.error || !history.data) throw new Error("无法读取晋级申请状态");
  const capabilityHistory = history.data;
  const targetLevel = capabilityHistory.to_level + 1;
  const levelDefinition = (definition.data ?? []).find((item) => item.model_version_id === capabilityHistory.model_version_id && item.level === targetLevel);
  const requirement = (requirements.data ?? []).find((item) => item.capability_level_definition_id === levelDefinition?.id);
  const targetMilestones = (milestones.data ?? []).filter((item) => item.capability_level_definition_id === levelDefinition?.id);
  const completed = new Set((progress.data ?? []).filter((item) => item.status === "completed").map((item) => item.milestone_definition_id));
  const levelByEvidence = new Map((evidence.data ?? []).map((item) => [item.id, item.evidence_level]));
  const linkedLevels = (evidenceLinks.data ?? []).map((item) => levelByEvidence.get(item.evidence_id)).filter((level): level is number => level !== undefined);
  const atLeast = (level: number) => linkedLevels.filter((item) => item >= level).length;
  const eligible = Boolean(targetLevel <= 5 && requirement && targetMilestones.every((item) => completed.has(item.id)) && linkedLevels.length >= requirement.minimum_total && atLeast(1) >= requirement.minimum_e1_plus && atLeast(2) >= requirement.minimum_e2_plus && atLeast(3) >= requirement.minimum_e3_plus && atLeast(4) >= requirement.minimum_e4_plus && atLeast(5) >= requirement.minimum_e5);
  return <div className="record-detail-page"><PageHeader title={`${capability.data.name}晋级申请`} description={application.data ? "申请已提交。请在确认前再次核对真实证据与人工判断。" : eligible ? "系统已通过基础条件核验；仍需你完成人工核对。" : "当前基础条件尚未满足。请返回能力发展页查看缺口。"} />{application.data ? <PromotionForm capabilityId={capability.data.id} modelVersionId={capabilityHistory.model_version_id} currentLevel={capabilityHistory.to_level} applicationId={application.data.id} /> : eligible ? <PromotionForm capabilityId={capability.data.id} modelVersionId={capabilityHistory.model_version_id} currentLevel={capabilityHistory.to_level} /> : <Link className="button button--secondary" href="/capabilities">返回能力发展</Link>}</div>;
}
