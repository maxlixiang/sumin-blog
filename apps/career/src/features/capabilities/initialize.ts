import { requireUser } from "@/lib/auth/require-user";

type AuthenticatedCareerContext = Awaited<ReturnType<typeof requireUser>>;

export async function ensureCapabilityState(context?: AuthenticatedCareerContext) {
  const current = context ?? await requireUser();
  const { error } = await current.supabase.rpc("initialize_capability_state");
  if (error) throw new Error("无法初始化能力评估状态");
  return current;
}
