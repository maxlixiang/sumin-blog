"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth/require-user";

const submitSchema = z.object({ capabilityId: z.string().uuid(), modelVersionId: z.string().uuid(), currentLevel: z.coerce.number().int().min(1).max(4), statement: z.string().trim().min(20, "请用至少 20 个字符说明真实证据。").max(4000), manualConfirmed: z.literal("on") });
const approveSchema = z.object({ applicationId: z.string().uuid(), reason: z.string().trim().min(20, "请写明批准依据，至少 20 个字符。").max(4000), explicitApproval: z.literal("on") });
export type PromotionFormState = { message?: string; fieldErrors?: Record<string, string[]> };

export async function submitPromotionApplication(_state: PromotionFormState, formData: FormData): Promise<PromotionFormState> {
  const parsed = submitSchema.safeParse({ capabilityId: formData.get("capabilityId"), modelVersionId: formData.get("modelVersionId"), currentLevel: formData.get("currentLevel"), statement: formData.get("statement"), manualConfirmed: formData.get("manualConfirmed") });
  if (!parsed.success) return { message: "请完整填写申请与人工核对声明。", fieldErrors: parsed.error.flatten().fieldErrors };
  const { supabase, userId } = await requireUser(); const input = parsed.data;
  const [history, definition, requirements, milestones, progress, evidence, evidenceLinks, existing] = await Promise.all([
    supabase.from("capability_level_history").select("to_level").eq("user_id", userId).eq("capability_id", input.capabilityId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("capability_level_definitions").select("id").eq("model_version_id", input.modelVersionId).eq("capability_id", input.capabilityId).eq("level", input.currentLevel + 1).maybeSingle(),
    supabase.from("evidence_requirement_definitions").select("*").limit(100), supabase.from("milestone_definitions").select("id, capability_level_definition_id"),
    supabase.from("user_milestone_progress").select("milestone_definition_id, status"), supabase.from("evidence").select("id, evidence_level"),
    supabase.from("evidence_capabilities").select("evidence_id, capability_id").eq("capability_id", input.capabilityId),
    supabase.from("promotion_applications").select("id").eq("user_id", userId).eq("capability_id", input.capabilityId).in("status", ["under_review", "review_completed"]).limit(1),
  ]);
  if (history.error || definition.error || requirements.error || milestones.error || progress.error || evidence.error || evidenceLinks.error || existing.error || history.data?.to_level !== input.currentLevel || !definition.data || existing.data.length) return { message: "当前申请条件已变化，请返回能力页重新确认。" };
  const targetDefinitionId = definition.data.id;
  const requirement = requirements.data.find((row) => row.capability_level_definition_id === targetDefinitionId);
  const targetMilestones = milestones.data.filter((row) => row.capability_level_definition_id === targetDefinitionId);
  const completed = new Set(progress.data.filter((row) => row.status === "completed").map((row) => row.milestone_definition_id));
  const levelByEvidence = new Map(evidence.data.map((row) => [row.id, row.evidence_level]));
  const levels = evidenceLinks.data.map((row) => levelByEvidence.get(row.evidence_id)).filter((level): level is number => level !== undefined);
  const countAtLeast = (level: number) => levels.filter((value) => value >= level).length;
  if (!requirement || targetMilestones.some((row) => !completed.has(row.id)) || levels.length < requirement.minimum_total || countAtLeast(1) < requirement.minimum_e1_plus || countAtLeast(2) < requirement.minimum_e2_plus || countAtLeast(3) < requirement.minimum_e3_plus || countAtLeast(4) < requirement.minimum_e4_plus || countAtLeast(5) < requirement.minimum_e5) return { message: "自动可验证的晋级门槛尚未满足。" };
  const { error } = await supabase.from("promotion_applications").insert({ user_id: userId, capability_id: input.capabilityId, model_version_id: input.modelVersionId, current_level: input.currentLevel, target_level: input.currentLevel + 1, status: "under_review", applicant_statement: input.statement, manual_requirement_confirmations: { confirmedByUser: true }, submitted_at: new Date().toISOString(), decided_at: null, decision_reason: "" });
  if (error) return { message: "申请保存失败，请重试。" };
  revalidatePath("/capabilities"); redirect(`/capabilities?promotion=${input.capabilityId}`);
}

export async function approvePromotionApplication(_state: PromotionFormState, formData: FormData): Promise<PromotionFormState> {
  const parsed = approveSchema.safeParse({ applicationId: formData.get("applicationId"), reason: formData.get("reason"), explicitApproval: formData.get("explicitApproval") });
  if (!parsed.success) return { message: "请完整填写批准依据并明确确认。", fieldErrors: parsed.error.flatten().fieldErrors };
  const { supabase } = await requireUser(); const { error } = await supabase.rpc("approve_promotion_application", { application_id: parsed.data.applicationId, approval_reason: parsed.data.reason });
  if (error) return { message: "批准失败：申请状态或当前等级可能已变化。" };
  revalidatePath("/"); revalidatePath("/capabilities"); redirect("/capabilities?approved=1");
}
