import { PageHeader } from "@/components/page-header";
import { RESPONSIBILITY_DEFINITIONS } from "@/lib/constants/career";
import { requireUser } from "@/lib/auth/require-user";
import { ResponsibilityForm } from "@/features/responsibility/form";
export default async function ResponsibilityPage() { const { supabase, userId } = await requireUser(); const history = await supabase.from("responsibility_level_history").select("*").eq("user_id", userId).order("created_at", { ascending: false }); if (history.error) throw new Error("无法读取责任等级历史"); const current = history.data[0]?.to_level ?? 2; return <div className="record-detail-page"><PageHeader title="责任成长" description="责任等级反映组织交付给你的问题范围；任何变更都需要你的明确确认。" /><ResponsibilityForm current={current} definitions={RESPONSIBILITY_DEFINITIONS} /></div>; }
