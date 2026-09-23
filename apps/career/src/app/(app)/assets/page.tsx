import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { getAssetTypeLabel } from "@/lib/constants/growth-records";
import { formatChineseDate } from "@/lib/date";
import { requireUser } from "@/lib/auth/require-user";

export const metadata: Metadata = { title: "职业资产" };

export default async function AssetsPage({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const query = await searchParams;
  const { supabase } = await requireUser();
  const { data, error } = await supabase.from("career_assets").select("*").order("asset_date", { ascending: false });
  if (error) throw new Error("无法读取职业资产");
  return <div className="records-page">
    <PageHeader title="职业资产" description="查看过去真正留下来的成果、模型、地图与方法。" />
    <div className="records-toolbar records-toolbar--end"><Link className="button button--primary" href="/assets/new">创建职业资产</Link></div>
    {query.deleted ? <p className="notice notice--success">职业资产已删除。</p> : null}
    {data.length ? <div className="record-list record-list--assets">{data.map((item) => <Link className="record-card" href={`/assets/${item.id}`} key={item.id}><div className="record-card__meta"><span className="asset-type">{getAssetTypeLabel(item.asset_type)}</span><time>{formatChineseDate(item.asset_date)}</time></div><h2>{item.title}</h2><p>{item.description}</p></Link>)}</div> : <div className="empty-state"><h2>还没有职业资产</h2><p>当一项成果值得在一年后继续使用或回看，它就可以成为职业资产。</p><Link className="button button--primary" href="/assets/new">创建第一项资产</Link></div>}
  </div>;
}
