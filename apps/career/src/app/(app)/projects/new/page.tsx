import { PageHeader } from "@/components/page-header";
import { DevelopmentProjectForm } from "@/features/projects/development-project-form";
import { requireUser } from "@/lib/auth/require-user";

export default async function NewProjectPage() {
  const { supabase } = await requireUser();
  const [capabilities, evidence] = await Promise.all([supabase.from("capabilities").select("*").order("display_order"), supabase.from("evidence").select("*").order("occurred_on", { ascending: false })]);
  if (capabilities.error || evidence.error) throw new Error("无法读取项目表单数据");
  return <div className="record-detail-page"><PageHeader title="创建发展项目" description="只记录值得持续投入、能产生真实成长的项目。" /><DevelopmentProjectForm capabilities={capabilities.data} evidence={evidence.data} /></div>;
}
