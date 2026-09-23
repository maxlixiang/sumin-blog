import Link from "next/link";

export default function NotFound() {
  return (
    <div className="state-page">
      <p className="eyebrow">404</p>
      <h1>Career OS 中没有这个页面</h1>
      <p>返回职业成长总览，继续查看你的成长状态。</p>
      <Link className="button button--primary" href="/">返回总览</Link>
    </div>
  );
}

