"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth/require-user";
import { getTodayDate } from "@/lib/date";
const schema = z.object({ current: z.coerce.number().int().min(1).max(6), next: z.coerce.number().int().min(1).max(6), evidence: z.string().trim().min(20).max(4000), explanation: z.string().trim().min(20).max(4000), confirmed: z.literal("on") });
export async function updateResponsibilityLevel(_: { message?: string }, formData: FormData) {
  const parsed = schema.safeParse({ current: formData.get("current"), next: formData.get("next"), evidence: formData.get("evidence"), explanation: formData.get("explanation"), confirmed: formData.get("confirmed") });
  if (!parsed.success || parsed.data.next !== parsed.data.current + 1) return { message: "责任成长每次只能上调一个等级，请完整填写依据、说明并明确确认。" };
  const { supabase, userId } = await requireUser(); const input = parsed.data;
  const latest = await supabase.from("responsibility_level_history").select("to_level").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (latest.error || latest.data?.to_level !== input.current) return { message: "责任等级已变化，请刷新后重试。" };
  const { error } = await supabase.from("responsibility_level_history").insert({ user_id: userId, from_level: input.current, to_level: input.next, source: "self_approval", evidence_summary: input.evidence, change_explanation: input.explanation, effective_on: getTodayDate() });
  if (error) return { message: "保存失败，请重试。" };
  revalidatePath("/"); revalidatePath("/responsibility"); redirect("/responsibility?updated=1");
}
