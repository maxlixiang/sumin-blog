import type { ReactNode } from "react";

import { AppShell } from "@/components/navigation/app-shell";
import { ensureCapabilityState } from "@/features/capabilities/initialize";
import { requireUser } from "@/lib/auth/require-user";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  await ensureCapabilityState(user);

  return <AppShell>{children}</AppShell>;
}
