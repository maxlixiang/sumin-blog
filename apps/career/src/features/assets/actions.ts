"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { careerAssetSchema } from "@/features/assets/validation";
import { requireUser } from "@/lib/auth/require-user";

export interface CareerAssetFormState {
  status?: "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function saveCareerAsset(
  _state: CareerAssetFormState,
  formData: FormData,
): Promise<CareerAssetFormState> {
  const parsed = careerAssetSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    assetType: formData.get("assetType"),
    assetDate: formData.get("assetDate"),
    description: formData.get("description"),
    externalUrl: formData.get("externalUrl") ?? "",
    capabilityIds: formData.getAll("capabilityIds"),
    evidenceIds: formData.getAll("evidenceIds"),
  });
  if (!parsed.success) {
    return { status: "error", message: "请检查尚未完成的内容", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { supabase, userId } = await requireUser();
  const input = parsed.data;
  const payload = {
    title: input.title,
    asset_type: input.assetType,
    asset_date: input.assetDate,
    description: input.description,
    external_url: input.externalUrl || null,
  };
  let assetId = input.id;
  if (assetId) {
    const { data, error } = await supabase.from("career_assets").update(payload)
      .eq("id", assetId).eq("user_id", userId).select("id").maybeSingle();
    if (error || !data) return { status: "error", message: "保存失败，请重试" };
  } else {
    const { data, error } = await supabase.from("career_assets").insert({ ...payload, user_id: userId }).select("id").single();
    if (error || !data) return { status: "error", message: "保存失败，请重试" };
    assetId = data.id;
  }

  const [clearCapabilities, clearEvidence] = await Promise.all([
    supabase.from("career_asset_capabilities").delete().eq("career_asset_id", assetId).eq("user_id", userId),
    supabase.from("career_asset_evidence").delete().eq("career_asset_id", assetId).eq("user_id", userId),
  ]);
  if (clearCapabilities.error || clearEvidence.error) return { status: "error", message: "关联内容保存失败，请重试" };

  const relationResults = await Promise.all([
    supabase.from("career_asset_capabilities").insert(input.capabilityIds.map((capabilityId) => ({
      user_id: userId, career_asset_id: assetId, capability_id: capabilityId,
    }))),
    input.evidenceIds.length
      ? supabase.from("career_asset_evidence").insert(input.evidenceIds.map((evidenceId) => ({
          user_id: userId, career_asset_id: assetId, evidence_id: evidenceId,
        })))
      : Promise.resolve({ error: null }),
  ]);
  if (relationResults.some((result) => result.error)) return { status: "error", message: "关联内容保存失败，请重试" };

  revalidatePath("/");
  revalidatePath("/assets");
  revalidatePath(`/assets/${assetId}`);
  redirect(`/assets/${assetId}`);
}

export async function deleteCareerAsset(id: string) {
  const { supabase, userId } = await requireUser();
  await supabase.from("career_assets").delete().eq("id", id).eq("user_id", userId);
  revalidatePath("/");
  revalidatePath("/assets");
  redirect("/assets?deleted=1");
}
