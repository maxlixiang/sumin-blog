import Link from "next/link";
import type { ReactNode } from "react";

import { PlusIcon } from "@/components/icons";
import { AppNavigation } from "@/components/navigation/app-navigation";
import { logoutAction } from "@/features/auth/actions";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <aside className="desktop-sidebar">
        <Link className="brand" href="/" aria-label="Career OS 职业成长总览">
          <span className="brand__mark">C</span>
          <span className="brand__copy">
            <strong>Career OS</strong>
            <small>私人职业成长系统</small>
          </span>
        </Link>
        <AppNavigation variant="desktop" />
        <div className="sidebar-note">
          <span>专注真实成长证据</span>
          <form action={logoutAction}>
            <button className="logout-button" type="submit">退出登录</button>
          </form>
        </div>
      </aside>

      <header className="mobile-header">
        <Link className="mobile-brand" href="/">Career OS</Link>
        <Link className="button button--primary button--mobile" href="/evidence/new">
          <PlusIcon />
          <span>创建证据</span>
        </Link>
      </header>

      <main className="app-main">{children}</main>

      <AppNavigation variant="mobile" />
    </div>
  );
}

