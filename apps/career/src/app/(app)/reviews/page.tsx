import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { WeeklyReviewForm } from "@/features/reviews/weekly-review-form";
import { requireUser } from "@/lib/auth/require-user";
import { formatChineseDate, formatWeekRange, getIsoWeekStart } from "@/lib/date";

export const metadata: Metadata = { title: "复盘" };

export default async function ReviewsPage() {
  const weekStart = getIsoWeekStart();
  const { supabase } = await requireUser();
  const [currentResult, historyResult, capabilityResult] = await Promise.all([
    supabase.from("weekly_reviews").select("*").eq("week_start", weekStart).maybeSingle(),
    supabase.from("weekly_reviews").select("id, week_start, status, updated_at").order("week_start", { ascending: false }).limit(12),
    supabase.from("capabilities").select("*").order("display_order"),
  ]);
  if (currentResult.error || historyResult.error || capabilityResult.error) throw new Error("无法读取每周复盘");
  return <div className="records-page">
    <PageHeader title="每周复盘" description={`${formatWeekRange(weekStart)} · 从本周活动中识别真正发生的能力增长。`} status={currentResult.data?.status === "complete" ? "已完成" : currentResult.data ? "草稿" : undefined} />
    <WeeklyReviewForm key={currentResult.data?.updated_at ?? weekStart} review={currentResult.data} weekStart={weekStart} capabilities={capabilityResult.data} />
    {historyResult.data.length ? <section className="review-history"><h2>最近复盘</h2><div>{historyResult.data.map((item) => <article key={item.id}><span>{formatChineseDate(item.week_start)}</span><strong>{item.status === "complete" ? "已完成" : "草稿"}</strong></article>)}</div></section> : null}
  </div>;
}
