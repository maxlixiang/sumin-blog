import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { DevelopmentProjectForm } from "@/features/projects/development-project-form";
import { requireUser } from "@/lib/auth/require-user";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, userId } = await requireUser();
  const [project, capabilities, evidence, capabilityLinks, evidenceLinks] = await Promise.all([
    supabase.from("development_projects").select("*").eq("id", id).eq("user_id", userId).maybeSingle(),
    supabase.from("capabilities").select("*").order("display_order"), supabase.from("evidence").select("*").order("occurred_on", { ascending: false }),
    supabase.from("development_project_capabilities").select("capability_id").eq("development_project_id", id), supabase.from("evidence_project_links").select("evidence_id").eq("development_project_id", id),
  ]);
  if (project.error || capabilities.error || evidence.error || capabilityLinks.error || evidenceLinks.error) throw new Error("无法读取项目编辑数据");
  if (!project.data) notFound();
  return <div className="record-detail-page"><PageHeader title="编辑发展项目" description="更新项目状态、关联能力与证据。" /><DevelopmentProjectForm project={project.data} capabilities={capabilities.data} evidence={evidence.data} selectedCapabilityIds={capabilityLinks.data.map((item) => item.capability_id)} selectedEvidenceIds={evidenceLinks.data.map((item) => item.evidence_id)} /></div>;
}
