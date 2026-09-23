// Synthetic development data only.
// Never replace with real user/work information in source control.

import type {
  CapabilityLevel,
  CapabilitySlug,
  EvidenceLevel,
  ResponsibilityLevel,
} from "@/lib/constants/career";

export interface CapabilityFixture {
  slug: CapabilitySlug;
  level: CapabilityLevel;
  quarterEvidence: number;
  lastUpgraded: string;
  nextLevelRequirement: string;
}

export interface EvidenceFixture {
  id: string;
  title: string;
  capabilities: readonly CapabilitySlug[];
  level: EvidenceLevel;
  levelLabel: string;
  occurredOn: string;
}

export const DASHBOARD_FIXTURE = {
  responsibility: {
    current: 3 as ResponsibilityLevel,
    next: 4 as ResponsibilityLevel,
  },
  capabilities: [
    {
      slug: "business",
      level: 2,
      quarterEvidence: 3,
      lastUpgraded: "2026-06-18",
      nextLevelRequirement: "在真实工作中用商业背景支持一项具体建议。",
    },
    {
      slug: "finance",
      level: 1,
      quarterEvidence: 2,
      lastUpgraded: "2026-03-04",
      nextLevelRequirement: "把财务分析用于一项真实经营决策。",
    },
    {
      slug: "strategy",
      level: 2,
      quarterEvidence: 2,
      lastUpgraded: "2026-05-22",
      nextLevelRequirement: "将关键取舍转化为明确的战略选择。",
    },
    {
      slug: "execution",
      level: 3,
      quarterEvidence: 4,
      lastUpgraded: "2026-07-09",
      nextLevelRequirement: "端到端负责一项复杂结果的落地。",
    },
    {
      slug: "leadership",
      level: 2,
      quarterEvidence: 1,
      lastUpgraded: "2026-04-11",
      nextLevelRequirement: "通过授权与反馈帮助他人成长。",
    },
    {
      slug: "influence",
      level: 2,
      quarterEvidence: 1,
      lastUpgraded: "2026-08-02",
      nextLevelRequirement: "在相互竞争的优先事项之间推动形成共识。",
    },
  ] satisfies readonly CapabilityFixture[],
  quarter: [
    { label: "成长证据", value: 12 },
    { label: "商业案例", value: 3 },
    { label: "职业资产", value: 2 },
    { label: "每周复盘", value: 8 },
  ],
  recentEvidence: [
    {
      id: "synthetic-evidence-1",
      title: "经销商账期对现金流影响分析",
      capabilities: ["finance", "business"],
      level: 3,
      levelLabel: "应用证据",
      occurredOn: "2026-09-16",
    },
    {
      id: "synthetic-evidence-2",
      title: "零售渠道上市方案比较",
      capabilities: ["strategy", "business"],
      level: 2,
      levelLabel: "分析证据",
      occurredOn: "2026-09-09",
    },
    {
      id: "synthetic-evidence-3",
      title: "跨部门流程重构",
      capabilities: ["execution", "influence"],
      level: 3,
      levelLabel: "应用证据",
      occurredOn: "2026-08-28",
    },
    {
      id: "synthetic-evidence-4",
      title: "关键利益相关方共识工作坊",
      capabilities: ["leadership", "influence"],
      level: 2,
      levelLabel: "分析证据",
      occurredOn: "2026-08-19",
    },
  ] satisfies readonly EvidenceFixture[],
  focus: [
    {
      slug: "business" as CapabilitySlug,
      targetLevel: 3 as CapabilityLevel,
      proofPrompt: "围绕可衡量的商业结果提出建议。",
    },
    {
      slug: "finance" as CapabilitySlug,
      targetLevel: 2 as CapabilityLevel,
      proofPrompt: "用经营数字解释一项真实决策及其取舍。",
    },
  ],
} as const;

