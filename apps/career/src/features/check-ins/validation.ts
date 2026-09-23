import { z } from "zod";

const booleanAnswer = z.enum(["true", "false"], {
  error: "请选择有或没有",
}).transform((value) => value === "true");

export const dailyCheckInSchema = z.object({
  checkInDate: z.iso.date(),
  businessLearning: z.string().trim().min(1, "请填写今天最大的业务学习").max(4000),
  judgmentMade: z.string().trim().min(1, "请填写今天做出的重要判断").max(4000),
  crossedLegalBoundary: booleanAnswer,
  boundaryDetails: z.string().trim().max(4000).optional().default(""),
  hasEvidence: booleanAnswer,
}).superRefine((data, context) => {
  if (data.crossedLegalBoundary && !data.boundaryDetails) {
    context.addIssue({
      code: "custom",
      path: ["boundaryDetails"],
      message: "请简要说明具体做了什么",
    });
  }
});

export type DailyCheckInInput = z.infer<typeof dailyCheckInSchema>;
