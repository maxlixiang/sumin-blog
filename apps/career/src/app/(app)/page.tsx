import { Dashboard } from "@/features/dashboard/dashboard";
import { requireUser } from "@/lib/auth/require-user";
import type { CapabilityLevel, CapabilitySlug, EvidenceLevel, ResponsibilityLevel } from "@/lib/constants/career";
import { getEvidenceLevelLabel } from "@/lib/constants/growth-records";
import { getNextQuarterStart, getQuarterStart, getTodayDate } from "@/lib/date";

export default async function DashboardPage() {
  const today = getTodayDate();
  const { supabase, userId } = await requireUser();
  const quarterStart = getQuarterStart(today);
  const quarterEnd = getNextQuarterStart(today);
  const [todayResult, dailyResult, evidenceCountResult, assetCountResult, reviewCountResult, recentResult, capabilityResult, historyResult, responsibilityResult, definitionResult, quarterEvidenceRowsResult] = await Promise.all([
    supabase.from("daily_check_ins").select("id").eq("check_in_date", today).maybeSingle(),
    supabase.from("daily_check_ins").select("id", { count: "exact", head: true }).gte("check_in_date", quarterStart).lt("check_in_date", quarterEnd),
    supabase.from("evidence").select("id", { count: "exact", head: true }).gte("occurred_on", quarterStart).lt("occurred_on", quarterEnd),
    supabase.from("career_assets").select("id", { count: "exact", head: true }).gte("asset_date", quarterStart).lt("asset_date", quarterEnd),
    supabase.from("weekly_reviews").select("id", { count: "exact", head: true }).gte("week_start", quarterStart).lt("week_start", quarterEnd),
    supabase.from("evidence").select("id, title, occurred_on, evidence_level").order("occurred_on", { ascending: false }).limit(5),
    supabase.from("capabilities").select("id, slug"),
    supabase.from("capability_level_history").select("capability_id, to_level, effective_on, created_at").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("responsibility_level_history").select("to_level").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("capability_level_definitions").select("capability_id, level, promotion_statement"),
    supabase.from("evidence").select("id").gte("occurred_on", quarterStart).lt("occurred_on", quarterEnd),
  ]);

  if ([todayResult, dailyResult, evidenceCountResult, assetCountResult, reviewCountResult, recentResult, capabilityResult, historyResult, responsibilityResult, definitionResult, quarterEvidenceRowsResult].some((result) => result.error)) {
    throw new Error("无法读取职业成长总览");
  }

  const recentRows = recentResult.data ?? [];
  const capabilityRows = capabilityResult.data ?? [];
  const latestHistoryByCapability = new Map<string, { level: CapabilityLevel; effectiveOn: string }>();
  for (const history of historyResult.data ?? []) {
    if (!latestHistoryByCapability.has(history.capability_id)) latestHistoryByCapability.set(history.capability_id, { level: history.to_level as CapabilityLevel, effectiveOn: history.effective_on });
  }
  const recentIds = recentRows.map((item) => item.id);
  const relationResult = recentIds.length
    ? await supabase.from("evidence_capabilities").select("evidence_id, capability_id").in("evidence_id", recentIds)
    : { data: [], error: null };
  if (relationResult.error) throw new Error("无法读取最近成长证据");
  const quarterEvidenceIds = (quarterEvidenceRowsResult.data ?? []).map((item) => item.id);
  const quarterRelationResult = quarterEvidenceIds.length
    ? await supabase.from("evidence_capabilities").select("capability_id, evidence_id").in("evidence_id", quarterEvidenceIds)
    : { data: [], error: null };
  if (quarterRelationResult.error) throw new Error("无法读取能力证据");
  const slugById = new Map(capabilityRows.map((item) => [item.id, item.slug as CapabilitySlug]));
  const recentEvidence = recentRows.map((item) => ({
    id: item.id,
    title: item.title,
    occurredOn: item.occurred_on,
    level: item.evidence_level as EvidenceLevel,
    levelLabel: getEvidenceLevelLabel(item.evidence_level),
    capabilities: relationResult.data.filter((relation) => relation.evidence_id === item.id).map((relation) => slugById.get(relation.capability_id)).filter(Boolean) as CapabilitySlug[],
  }));
  const definitionByKey = new Map((definitionResult.data ?? []).map((definition) => [`${definition.capability_id}:${definition.level}`, definition.promotion_statement]));
  const capabilities = capabilityRows.map((capability) => {
    const history = latestHistoryByCapability.get(capability.id);
    const level = history?.level ?? 1 as CapabilityLevel;
    return {
      slug: capability.slug as CapabilitySlug,
      level,
      quarterEvidence: quarterRelationResult.data.filter((relation) => relation.capability_id === capability.id).length,
      lastUpgraded: history?.effectiveOn ?? today,
      nextLevelRequirement: level === 5 ? "持续以组织化方式验证成熟度。" : definitionByKey.get(`${capability.id}:${level}`) ?? "完成当前等级的必修里程碑与证据要求。",
    };
  });
  const currentResponsibility = (responsibilityResult.data?.to_level ?? 2) as ResponsibilityLevel;

  return (
    <Dashboard
      todayCompleted={Boolean(todayResult.data)}
      quarterDailyCount={dailyResult.count ?? 0}
      quarterEvidenceCount={evidenceCountResult.count ?? 0}
      quarterAssetCount={assetCountResult.count ?? 0}
      quarterReviewCount={reviewCountResult.count ?? 0}
      recentEvidence={recentEvidence}
      capabilities={capabilities}
      responsibility={{ current: currentResponsibility, next: Math.min(currentResponsibility + 1, 6) as ResponsibilityLevel }}
    />
  );
}
