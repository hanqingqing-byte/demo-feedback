import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyShareLinkButton } from "@/components/copy-share-link-button";
import { DeleteDemoButton } from "@/components/delete-demo-button";
import { requireUser } from "@/lib/auth";
import { getAdminDemoByToken } from "@/lib/storage";
import { formatDate, getBaseUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminFeedbackPage({
  params
}: {
  params: Promise<{ shareToken: string }>;
}) {
  const { shareToken } = await params;
  const user = await requireUser();
  const demo = await getAdminDemoByToken(shareToken, user?.id);

  if (!demo) {
    notFound();
  }

  return (
    <main className="shell">
      <section className="editorShell adminShell">
        <div className="editorTopbar">
          <Link className="backLink" href="/">
            &lt; Demo Feedback
          </Link>
          <div className="toolbar">
            <Link className="buttonSecondary" href={`/demos/${shareToken}`}>
              打开公开页
            </Link>
          </div>
        </div>

        <div className="adminHeaderBlock">
          <h1 className="editorTitle">{demo.title}</h1>
          <p className="muted adminDescription">
            {demo.description || "这条 Demo 还没有填写描述。"}
          </p>
        </div>

        <div className="adminThumbHeader">
          <div className="thumbStrip thumbStripCompact">
            {demo.images.map((image) => (
              <div className="thumbMini" key={image.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt={demo.title} src={image.url} />
              </div>
            ))}
          </div>
          <div className="wireActionRow">
            <CopyShareLinkButton url={`${getBaseUrl()}/demos/${shareToken}`} variant="primary" />
            <DeleteDemoButton redirectToHome shareToken={shareToken} title={demo.title} />
          </div>
          <div className="meta">
            <span>{demo.images.length} 张图</span>
            <span>{demo.feedback.length} 条建议</span>
            <span>更新于 {formatDate(demo.updatedAt)}</span>
          </div>
        </div>

        <section className="panel adminListPanel">
          <div className="panelHeader">
            <div>
              <span className="pill">反馈列表</span>
              <h2 className="panelTitle" style={{ marginTop: 12 }}>
                这条 Demo 收到的全部建议
              </h2>
            </div>
          </div>
          {demo.feedback.length === 0 ? (
            <div className="emptyState">还没有人提交建议。把公开链接发出去后，反馈会自动沉到这里。</div>
          ) : (
            <div className="feedbackList">
              {demo.feedback.map((item) => (
                <article className="adminListCard" key={item.id}>
                  <div className="adminFeedbackTop">
                    <strong>{item.nickname || "匿名访客"}</strong>
                    <span className="adminFeedbackBadge">NEW</span>
                  </div>
                  <p className="adminFeedbackBody">{item.content}</p>
                  <div className="meta">
                    <span>{item.deviceType}</span>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
