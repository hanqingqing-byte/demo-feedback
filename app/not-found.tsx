import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="shell">
      <section className="hero">
        <div className="heroCard">
          <span className="eyebrow">404</span>
          <h1>这个 Demo 链接不存在。</h1>
          <p>可能是链接输错了，或者这条 Demo 还没有创建成功。</p>
          <div className="ctaRow">
            <Link className="button" href="/">
              返回后台首页
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
