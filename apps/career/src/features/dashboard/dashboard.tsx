import { CapabilityGrid } from "@/components/dashboard/capability-grid";
import { CurrentFocus } from "@/components/dashboard/current-focus";
import { QuarterSummary } from "@/components/dashboard/quarter-summary";
import { RecentEvidence } from "@/components/dashboard/recent-evidence";
import { ResponsibilityPanel } from "@/components/dashboard/responsibility-panel";
import { PageHeader } from "@/components/page-header";
import type { DashboardCapability } from "@/components/dashboard/capability-grid";
import type { EvidenceFixture } from "@/lib/fixtures/dashboard";
import type { ResponsibilityLevel } from "@/lib/constants/career";

export function Dashboard({
  todayCompleted,
  quarterDailyCount,
  quarterEvidenceCount,
  quarterAssetCount,
  quarterReviewCount,
  recentEvidence,
  capabilities,
  responsibility,
}: {
  todayCompleted: boolean;
  quarterDailyCount: number;
  quarterEvidenceCount: number;
  quarterAssetCount: number;
  quarterReviewCount: number;
  recentEvidence: readonly EvidenceFixture[];
  capabilities: readonly DashboardCapability[];
  responsibility: { current: ResponsibilityLevel; next: ResponsibilityLevel };
}) {
  const quarterItems = [
    { label: "每日记录", value: quarterDailyCount },
    { label: "成长证据", value: quarterEvidenceCount },
    { label: "职业资产", value: quarterAssetCount },
    { label: "每周复盘", value: quarterReviewCount },
  ] as const;

  return (
    <div className="dashboard-page">
      <PageHeader
        title="职业成长总览"
        description={`看清我现在的位置、正在增长的能力，以及下一阶段需要重点突破的方向。${todayCompleted ? " 今日记录已完成。" : " 今日记录尚未完成。"}`}
        dashboardActions
      />
      <ResponsibilityPanel {...responsibility} />
      <CapabilityGrid capabilities={capabilities} />
      <QuarterSummary items={quarterItems} />
      <div className="dashboard-page__lower-grid">
        <RecentEvidence evidence={recentEvidence} />
        <CurrentFocus items={capabilities.slice(0, 2).map((capability) => ({
          slug: capability.slug,
          targetLevel: Math.min(capability.level + 1, 5) as 1 | 2 | 3 | 4 | 5,
          proofPrompt: capability.nextLevelRequirement,
        }))} />
      </div>
    </div>
  );
}

