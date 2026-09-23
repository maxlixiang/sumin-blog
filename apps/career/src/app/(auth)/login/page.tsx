import type { Metadata } from "next";

import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = { title: "登录" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;

  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-brand" aria-hidden="true">C</div>
        <h1 id="login-title">Career OS</h1>
        <p>私人职业成长系统</p>
        {reason === "configuration" ? (
          <p className="configuration-note" role="status">
            本地环境尚未配置 Supabase。请先在 .env.local 中添加项目连接信息。
          </p>
        ) : null}
        <LoginForm />
      </section>
    </main>
  );
}
