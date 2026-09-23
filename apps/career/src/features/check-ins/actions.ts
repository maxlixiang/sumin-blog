"use server";

import { revalidatePath } from "next/cache";

import { dailyCheckInSchema } from "@/features/check-ins/validation";
import { createClient } from "@/lib/supabase/server";

export interface DailyCheckInState {
  status?: "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function saveDailyCheckIn(
  _state: DailyCheckInState,
  formData: FormData,
): Promise<DailyCheckInState> {
  const parsed = dailyCheckInSchema.safeParse({
    checkInDate: formData.get("checkInDate"),
    businessLearning: formData.get("businessLearning"),
    judgmentMade: formData.get("judgmentMade"),
    crossedLegalBoundary: formData.get("crossedLegalBoundary"),
    boundaryDetails: formData.get("boundaryDetails"),
    hasEvidence: formData.get("hasEvidence"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "请检查尚未完成的内容",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = await createClient();
    const { data: claimsData } = await supabase.auth.getClaims();
    const userId = claimsData?.claims?.sub;
    if (!userId) return { status: "error", message: "登录已失效，请重新登录" };

    const input = parsed.data;
    const { error } = await supabase.from("daily_check_ins").upsert(
      {
        user_id: userId,
        check_in_date: input.checkInDate,
        business_learning: input.businessLearning,
        judgment_made: input.judgmentMade,
        crossed_legal_boundary: input.crossedLegalBoundary,
        boundary_details: input.crossedLegalBoundary ? input.boundaryDetails : null,
        has_evidence: input.hasEvidence,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,check_in_date" },
    );

    if (error) return { status: "error", message: "保存失败，请重试" };

    revalidatePath("/");
    revalidatePath("/daily");
    return { status: "success", message: "今日记录已保存" };
  } catch {
    return { status: "error", message: "保存失败，请重试" };
  }
}
