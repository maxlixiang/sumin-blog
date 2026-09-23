"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { evidenceSchema } from "@/features/evidence/validation";
import { requireUser } from "@/lib/auth/require-user";

export interface EvidenceFormState {
  status?: "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function saveEvidence(
  _state: EvidenceFormState,
  formData: FormData,
): Promise<EvidenceFormState> {
  const parsed = evidenceSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    occurredOn: formData.get("occurredOn"),
    event: formData.get("event"),
    action: formData.get("action"),
    judgment: formData.get("judgment"),
    result: formData.get("result"),
    reflection: formData.get("reflection"),
    evidenceLevel: formData.get("evidenceLevel"),
    dailyCheckInId: formData.get("dailyCheckInId") || "",
    externalUrl: formData.get("externalUrl") ?? "",
    capabilityIds: formData.getAll("capabilityIds"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "请检查尚未完成的内容",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { supabase, userId } = await requireUser();
  const input = parsed.data;
  const payload = {
    title: input.title,
    occurred_on: input.occurredOn,
    event: input.event,
    action: input.action,
    judgment: input.judgment,
    result: input.result,
    reflection: input.reflection,
    evidence_level: input.evidenceLevel,
    daily_check_in_id: input.dailyCheckInId || null,
    external_url: input.externalUrl || null,
  };

  let evidenceId = input.id;
  if (evidenceId) {
    const { data, error } = await supabase
      .from("evidence")
      .update(payload)
      .eq("id", evidenceId)
      .eq("user_id", userId)
      .select("id")
      .maybeSingle();
    if (error || !data) return { status: "error", message: "保存失败，请重试" };
  } else {
    const { data, error } = await supabase.from("evidence").insert({ ...payload, user_id: userId }).select("id").single();
    if (error || !data) return { status: "error", message: "保存失败，请重试" };
    evidenceId = data.id;
  }

  const { error: clearError } = await supabase
    .from("evidence_capabilities")
    .delete()
    .eq("evidence_id", evidenceId)
    .eq("user_id", userId);
  if (clearError) return { status: "error", message: "能力关联保存失败，请重试" };

  const { error: relationError } = await supabase.from("evidence_capabilities").insert(
    input.capabilityIds.map((capabilityId) => ({
      user_id: userId,
      evidence_id: evidenceId,
      capability_id: capabilityId,
    })),
  );
  if (relationError) return { status: "error", message: "能力关联保存失败，请重试" };

  revalidatePath("/");
  revalidatePath("/evidence");
  revalidatePath(`/evidence/${evidenceId}`);
  redirect(`/evidence/${evidenceId}`);
}

export async function deleteEvidence(id: string) {
  const { supabase, userId } = await requireUser();
  const { error } = await supabase.from("evidence").delete().eq("id", id).eq("user_id", userId);
  if (error) redirect(`/evidence/${id}?delete=linked`);
  revalidatePath("/");
  revalidatePath("/evidence");
  redirect("/evidence?deleted=1");
}
