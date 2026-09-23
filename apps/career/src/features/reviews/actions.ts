"use server";

import { revalidatePath } from "next/cache";

import { weeklyReviewSchema } from "@/features/reviews/validation";
import { requireUser } from "@/lib/auth/require-user";

export interface WeeklyReviewState {
  status?: "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function saveWeeklyReview(
  _state: WeeklyReviewState,
  formData: FormData,
): Promise<WeeklyReviewState> {
  const parsed = weeklyReviewSchema.safeParse({
    weekStart: formData.get("weekStart"),
    businessDeepDive: formData.get("businessDeepDive") ?? "",
    businessCase: formData.get("businessCase") ?? "",
    managementReview: formData.get("managementReview") ?? "",
    industryInput: formData.get("industryInput") ?? "",
    industryRelevance: formData.get("industryRelevance") ?? "",
    evidenceCapabilityId: formData.get("evidenceCapabilityId") ?? "",
    evidenceSummary: formData.get("evidenceSummary") ?? "",
    nextFocusCapabilityId: formData.get("nextFocusCapabilityId") ?? "",
    nextFocusPlan: formData.get("nextFocusPlan") ?? "",
    intent: formData.get("intent"),
  });
  if (!parsed.success) {
    return { status: "error", message: "请检查尚未完成的内容", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { supabase, userId } = await requireUser();
  const input = parsed.data;
  const { error } = await supabase.from("weekly_reviews").upsert({
    user_id: userId,
    week_start: input.weekStart,
    business_deep_dive: input.businessDeepDive,
    business_case: input.businessCase,
    management_review: input.managementReview,
    industry_input: input.industryInput,
    industry_relevance: input.industryRelevance,
    evidence_capability_id: input.evidenceCapabilityId || null,
    evidence_summary: input.evidenceSummary,
    next_focus_capability_id: input.nextFocusCapabilityId || null,
    next_focus_plan: input.nextFocusPlan,
    status: input.intent,
    completed_at: input.intent === "complete" ? new Date().toISOString() : null,
  }, { onConflict: "user_id,week_start" });

  if (error) return { status: "error", message: "保存失败，请重试" };
  revalidatePath("/");
  revalidatePath("/reviews");
  return { status: "success", message: input.intent === "complete" ? "本周复盘已完成" : "草稿已保存" };
}
