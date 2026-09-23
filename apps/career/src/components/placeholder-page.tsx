import Link from "next/link";

import { ArrowIcon } from "@/components/icons";
import { PageHeader } from "@/components/page-header";

interface PlaceholderPageProps {
  title: string;
  description: string;
  phase: string;
  plannedItems: readonly string[];
}

export function PlaceholderPage({ title, description, phase, plannedItems }: PlaceholderPageProps) {
  return (
    <div className="placeholder-page">
      <PageHeader title={title} description={description} />
      <section className="placeholder-panel">
        <span className="phase-label">计划阶段：{phase}</span>
        <h2>{title}功能尚未开放</h2>
        <p>当前仅保留入口，不提前实现后续阶段的数据与工作流。</p>
        <ul>
          {plannedItems.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <Link className="section-link" href="/">返回职业成长总览 <ArrowIcon /></Link>
      </section>
    </div>
  );
}

