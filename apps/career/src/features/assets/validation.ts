import { z } from "zod";

import { ASSET_TYPES } from "@/lib/constants/growth-records";

const assetTypeValues = ASSET_TYPES.map((item) => item.value) as [string, ...string[]];

export const careerAssetSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1, "请填写资产标题").max(160),
  assetType: z.enum(assetTypeValues),
  assetDate: z.iso.date(),
  description: z.string().trim().min(1, "请说明这项资产的长期价值").max(4000),
  externalUrl: z.string().trim().max(2048).refine(
    (value) => value === "" || /^https?:\/\//i.test(value),
    "请输入以 http:// 或 https:// 开头的完整链接",
  ),
  capabilityIds: z.array(z.string().uuid()).min(1, "请至少选择一项能力"),
  evidenceIds: z.array(z.string().uuid()),
});
