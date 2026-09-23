import { z } from "zod";

export const weeklyReviewSchema = z.object({
  weekStart: z.iso.date(),
  businessDeepDive: z.string().trim().max(4000),
  businessCase: z.string().trim().max(4000),
  managementReview: z.string().trim().max(4000),
  industryInput: z.string().trim().max(4000),
  industryRelevance: z.string().trim().max(4000),
  evidenceCapabilityId: z.union([z.string().uuid(), z.literal("")]),
  evidenceSummary: z.string().trim().max(4000),
  nextFocusCapabilityId: z.union([z.string().uuid(), z.literal("")]),
  nextFocusPlan: z.string().trim().max(4000),
  intent: z.enum(["draft", "complete"]),
}).superRefine((data, context) => {
  if (data.intent === "draft") return;
  const required: Array<[keyof typeof data, string]> = [
    ["businessDeepDive", "请填写本周业务深挖"],
    ["businessCase", "请填写本周 Business Case"],
    ["managementReview", "请填写管理或协作复盘"],
    ["industryInput", "请填写行业输入"],
    ["industryRelevance", "请说明与当前业务的关系"],
    ["evidenceCapabilityId", "请选择产生最有效证据的能力"],
    ["evidenceSummary", "请说明这项证据"],
    ["nextFocusCapabilityId", "请选择下周重点能力"],
    ["nextFocusPlan", "请填写训练计划"],
  ];
  for (const [field, message] of required) {
    if (!data[field]) context.addIssue({ code: "custom", path: [field], message });
  }
});
