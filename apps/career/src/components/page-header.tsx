import Link from "next/link";

import { DailyIcon, PlusIcon } from "@/components/icons";

interface PageHeaderProps {
  title: string;
  description: string;
  dashboardActions?: boolean;
  status?: string;
}

export function PageHeader({ title, description, dashboardActions = false, status }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {dashboardActions ? (
        <div className="page-header__actions">
          <span className="fixture-label">能力评估待后续阶段</span>
          <Link className="button button--secondary" href="/daily"><DailyIcon />今日记录</Link>
          <Link className="button button--primary" href="/evidence/new"><PlusIcon />创建证据</Link>
        </div>
      ) : status ? <span className="page-status">{status}</span> : null}
    </header>
  );
}

