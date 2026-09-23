"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { developmentProjectSchema, milestoneProgressSchema } from "@/features/projects/validation";
import { requireUser } from "@/lib/auth/require-user";
import { getTodayDate } from "@/lib/date";

export interface ProjectFormState { status?: "error"; message?: string; fieldErrors?: Record<string, string[]>; }

export async function saveDevelopmentProject(_state: ProjectFormState, formData: FormData): Promise<ProjectFormState> {
  const parsed = developmentProjectSchema.safeParse({
    id: formData.get("id") || undefined, title: formData.get("title"), projectType: formData.get("projectType"),
    status: formData.get("status"), objective: formData.get("objective"), context: formData.get("context"),
    targetDate: formData.get("targetDate") ?? "", externalUrl: formData.get("externalUrl") ?? "",
    capabilityIds: formData.getAll("capabilityIds"), evidenceIds: formData.getAll("evidenceIds"),
  });
  if (!parsed.success) return { status: "error", message: "请检查尚未完成的内容", fieldErrors: parsed.error.flatten().fieldErrors };

  const { supabase, userId } = await requireUser();
  const input = parsed.data;
  const payload = { title: input.title, project_type: input.projectType, status: input.status, objective: input.objective, context: input.context, target_date: input.targetDate || null, external_url: input.externalUrl || null, completed_on: input.status === "completed" ? getTodayDate() : null };
  let projectId = input.id;
  if (projectId) {
    const { data, error } = await supabase.from("development_projects").update(payload).eq("id", projectId).eq("user_id", userId).select("id").maybeSingle();
    if (error || !data) return { status: "error", message: "保存失败，请重试" };
  } else {
    const { data, error } = await supabase.from("development_projects").insert({ ...payload, user_id: userId }).select("id").single();
    if (error || !data) return { status: "error", message: "保存失败，请重试" };
    projectId = data.id;
  }

  const [clearCapabilities, clearEvidence] = await Promise.all([
    supabase.from("development_project_capabilities").delete().eq("development_project_id", projectId).eq("user_id", userId),
    supabase.from("evidence_project_links").delete().eq("development_project_id", projectId).eq("user_id", userId),
  ]);
  if (clearCapabilities.error || clearEvidence.error) return { status: "error", message: "关联内容保存失败，请重试" };
  const relations = await Promise.all([
    supabase.from("development_project_capabilities").insert(input.capabilityIds.map((capabilityId) => ({ user_id: userId, development_project_id: projectId, capability_id: capabilityId }))),
    input.evidenceIds.length ? supabase.from("evidence_project_links").insert(input.evidenceIds.map((evidenceId) => ({ user_id: userId, development_project_id: projectId, evidence_id: evidenceId }))) : Promise.resolve({ error: null }),
  ]);
  if (relations.some((result) => result.error)) return { status: "error", message: "关联内容保存失败，请重试" };
  revalidatePath("/"); revalidatePath("/capabilities"); revalidatePath("/projects"); revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}`);
}

export async function deleteDevelopmentProject(id: string) {
  const { supabase, userId } = await requireUser();
  const { error } = await supabase.from("development_projects").delete().eq("id", id).eq("user_id", userId);
  if (error) redirect(`/projects/${id}?delete=linked`);
  revalidatePath("/"); revalidatePath("/capabilities"); revalidatePath("/projects"); redirect("/projects?deleted=1");
}

export async function updateMilestoneProgress(_state: ProjectFormState, formData: FormData): Promise<ProjectFormState> {
  const parsed = milestoneProgressSchema.safeParse({ milestoneId: formData.get("milestoneId"), status: formData.get("status"), completionNote: formData.get("completionNote") });
  if (!parsed.success) return { status: "error", message: "请检查里程碑状态或说明" };
  const { supabase, userId } = await requireUser();
  const input = parsed.data;
  const { error } = await supabase.from("user_milestone_progress").upsert({
    user_id: userId, milestone_definition_id: input.milestoneId, status: input.status, completion_note: input.completionNote,
    supporting_evidence_id: null, development_project_id: null,
    completed_at: input.status === "completed" ? new Date().toISOString() : null,
  }, { onConflict: "user_id,milestone_definition_id" });
  if (error) return { status: "error", message: "状态更新失败，请重试" };
  revalidatePath("/capabilities");
  return {};
}
