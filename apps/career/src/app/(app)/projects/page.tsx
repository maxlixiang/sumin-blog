import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { formatChineseDate } from "@/lib/date";
import { requireUser } from "@/lib/auth/require-user";

export const metadata: Metadata = { title: "发展项目" };

const statusLabels = { planned: "计划中", active: "进行中", on_hold: "暂缓", completed: "已完成", archived: "已归档" } as const;

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const query = await searchParams;
  const { supabase } = await requireUser();
  const { data, error } = await supabase.from("development_projects").select("*").order("updated_at", { ascending: false });
  if (error) throw new Error("无法读取发展项目");
  return <div className="records-page">
    <PageHeader title="发展项目" description="把真实工作和刻意训练组织成持续推进、可复盘的能力发展项目。" />
    <div className="records-toolbar records-toolbar--end"><Link className="button button--primary" href="/projects/new">创建发展项目</Link></div>
    {query.deleted ? <p className="notice notice--success">发展项目已删除。</p> : null}
    {data.length ? <div className="record-list">{data.map((project) => <Link className="record-card" href={`/projects/${project.id}`} key={project.id}><div className="record-card__meta"><span className="asset-type">{statusLabels[project.status]}</span><time>{project.target_date ? `目标：${formatChineseDate(project.target_date)}` : "未设目标日期"}</time></div><h2>{project.title}</h2><p>{project.objective || project.context || "尚未填写项目目标。"}</p><div className="tag-row"><span>{project.project_type}</span></div></Link>)}</div> : <div className="empty-state"><h2>还没有发展项目</h2><p>从一个真实业务问题或需要刻意训练的能力开始。</p><Link className="button button--primary" href="/projects/new">创建第一个项目</Link></div>}
  </div>;
}
