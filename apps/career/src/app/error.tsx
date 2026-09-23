"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="state-page">
      <p className="eyebrow">Career OS</p>
      <h1>当前页面暂时无法加载</h1>
      <p>数据没有被修改，请重新加载页面。</p>
      <button className="button button--primary" type="button" onClick={reset}>重新加载</button>
    </div>
  );
}

