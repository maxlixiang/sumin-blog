import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { EvidenceForm } from "@/features/evidence/evidence-form";
import { requireUser } from "@/lib/auth/require-user";
import { getTodayDate } from "@/lib/date";

export const metadata: Metadata = { title: "创建成长证据" };
export default async function NewEvidencePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const requestedDate = typeof params.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : getTodayDate();
  const dailyId = typeof params.daily === "string" ? params.daily : null;
  const fromDaily = params.source === "daily" || Boolean(dailyId);
  const { supabase } = await requireUser();
  const [capabilityResult, dailyResult] = await Promise.all([
    supabase.from("capabilities").select("*").order("display_order"),
    fromDaily
      ? dailyId
        ? supabase.from("daily_check_ins").select("*").eq("id", dailyId).maybeSingle()
        : supabase.from("daily_check_ins").select("*").eq("check_in_date", requestedDate).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);
  if (capabilityResult.error || dailyResult.error) throw new Error("无法准备成长证据表单");
  return <div className="records-page"><PageHeader title="创建成长证据" description="用短而结构化的方式，留下这次经历真正证明了什么。" /><EvidenceForm capabilities={capabilityResult.data} dailyCheckIn={dailyResult.data} defaultDate={requestedDate} /></div>;
}
