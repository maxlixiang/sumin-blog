import { z } from "zod";

const projectStatuses = ["planned", "active", "on_hold", "completed", "archived"] as const;

export const developmentProjectSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1, "请填写项目名称").max(160),
  projectType: z.string().trim().min(1, "请选择项目类型").max(80),
  status: z.enum(projectStatuses),
  objective: z.string().trim().max(4000),
  context: z.string().trim().max(4000),
  targetDate: z.union([z.iso.date(), z.literal("")]),
  externalUrl: z.string().trim().max(2048).refine(
    (value) => value === "" || /^https?:\/\//i.test(value),
    "请输入以 http:// 或 https:// 开头的完整链接",
  ),
  capabilityIds: z.array(z.string().uuid()).min(1, "请至少选择一项重点能力"),
  evidenceIds: z.array(z.string().uuid()),
});

export const milestoneProgressSchema = z.object({
  milestoneId: z.string().uuid(),
  status: z.enum(["not_started", "in_progress", "completed"]),
  completionNote: z.string().trim().max(2000),
});
