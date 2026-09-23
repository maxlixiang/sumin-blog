import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { CareerAssetForm } from "@/features/assets/career-asset-form";
import { requireUser } from "@/lib/auth/require-user";
import { getTodayDate } from "@/lib/date";

export const metadata: Metadata = { title: "创建职业资产" };
export default async function NewAssetPage() {
  const { supabase } = await requireUser();
  const [capabilityResult, evidenceResult] = await Promise.all([
    supabase.from("capabilities").select("*").order("display_order"),
    supabase.from("evidence").select("*").order("occurred_on", { ascending: false }),
  ]);
  if (capabilityResult.error || evidenceResult.error) throw new Error("无法准备职业资产表单");
  return <div className="records-page"><PageHeader title="创建职业资产" description="保存一项可复用、可回看、能代表长期积累的职业成果。" /><CareerAssetForm capabilities={capabilityResult.data} evidence={evidenceResult.data} defaultDate={getTodayDate()} /></div>;
}
