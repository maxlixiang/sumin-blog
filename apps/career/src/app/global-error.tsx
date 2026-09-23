"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="zh-CN">
      <body>
        <main className="state-page">
          <h1>Career OS 暂时无法加载</h1>
          <p>请重新加载应用。</p>
          <button className="button button--primary" type="button" onClick={reset}>重新加载</button>
        </main>
      </body>
    </html>
  );
}

