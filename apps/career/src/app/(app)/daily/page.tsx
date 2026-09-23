import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { DailyCheckInForm } from "@/features/check-ins/daily-check-in-form";
import { requireUser } from "@/lib/auth/require-user";
import { formatChineseDate, getTodayDate } from "@/lib/date";

export const metadata: Metadata = { title: "今日记录" };

export default async function DailyPage() {
  const date = getTodayDate();
  const { supabase } = await requireUser();
  const { data: record, error } = await supabase
    .from("daily_check_ins")
    .select("*")
    .eq("check_in_date", date)
    .maybeSingle();

  if (error) throw new Error("无法读取今日记录");

  return (
    <div className="daily-page">
      <PageHeader
        title="今日记录"
        description={`${formatChineseDate(date)} · 用 3～5 分钟记录今天真正发生的成长。`}
        status={record ? "编辑今日记录" : undefined}
      />
      <DailyCheckInForm key={record?.updated_at ?? date} date={date} record={record} />
    </div>
  );
}
