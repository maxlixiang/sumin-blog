import type { CapabilitySlug, EvidenceLevel } from "@/lib/constants/career";

export const EVIDENCE_LEVELS: readonly { value: EvidenceLevel; label: string; shortLabel: string }[] = [
  { value: 0, label: "无有效证据", shortLabel: "无有效证据" },
  { value: 1, label: "学习证据", shortLabel: "学习" },
  { value: 2, label: "分析证据", shortLabel: "分析" },
  { value: 3, label: "应用证据", shortLabel: "应用" },
  { value: 4, label: "结果证据", shortLabel: "结果" },
  { value: 5, label: "组织证据", shortLabel: "组织" },
] as const;

export const ASSET_TYPES = [
  { value: "business_map", label: "业务地图" },
  { value: "financial_model", label: "财务模型" },
  { value: "p_and_l_simulation", label: "P&L 模拟" },
  { value: "business_case", label: "商业案例" },
  { value: "decision_memo", label: "决策备忘录" },
  { value: "market_research", label: "市场研究" },
  { value: "project_retrospective", label: "项目复盘" },
  { value: "leadership_review", label: "领导力复盘" },
  { value: "other", label: "其他" },
] as const;

export type AssetType = (typeof ASSET_TYPES)[number]["value"];

export function getEvidenceLevelLabel(level: number) {
  return EVIDENCE_LEVELS.find((item) => item.value === level)?.label ?? "未知等级";
}

export function getAssetTypeLabel(type: string) {
  return ASSET_TYPES.find((item) => item.value === type)?.label ?? "其他";
}

export function isCapabilitySlug(value: string): value is CapabilitySlug {
  return ["business", "finance", "strategy", "execution", "leadership", "influence"].includes(value);
}
