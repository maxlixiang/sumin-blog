import { z } from "zod";

const optionalUrl = z.string().trim().max(2048).refine(
  (value) => value === "" || /^https?:\/\//i.test(value),
  "请输入以 http:// 或 https:// 开头的完整链接",
);

export const evidenceSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1, "请填写证据标题").max(160),
  occurredOn: z.iso.date(),
  event: z.string().trim().min(1, "请简要描述发生了什么").max(2000),
  action: z.string().trim().min(1, "请简要描述你的行动").max(2000),
  judgment: z.string().trim().min(1, "请记录你做出的判断").max(2000),
  result: z.string().trim().min(1, "请记录真实结果").max(2000),
  reflection: z.string().trim().min(1, "请留下简短反思").max(4000),
  evidenceLevel: z.coerce.number().int().min(0).max(5),
  dailyCheckInId: z.union([z.string().uuid(), z.literal("")]).optional(),
  externalUrl: optionalUrl,
  capabilityIds: z.array(z.string().uuid()).min(1, "请至少选择一项能力"),
});

export type EvidenceInput = z.infer<typeof evidenceSchema>;
