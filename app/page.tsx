import Link from "next/link";
import { CopyShareLinkButton } from "@/components/copy-share-link-button";
import { DeleteDemoButton } from "@/components/delete-demo-button";
import { LogoutButton } from "@/components/logout-button";
import { requireUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { listDemosForCreator } from "@/lib/storage";
import { getBaseUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const authEnabled = isSupabaseConfigured();
  const user = await requireUser();
  const demos = await listDemosForCreator(user?.id);
  const baseUrl = getBaseUrl();

  return (
    <main className="shell">
      <section className="workspaceShell">
        <div className="workspaceHead">
          <div className="workspaceTitleBlock">
            <div className="topbarBrand">
              <div className="brandMark">DF</div>
              <div className="brandMeta">
                <div className="brandTitle">Demo Feedback</div>
                <div className="brandSubtitle">上传设计图片并分享链接，快速收集用户反馈</div>
              </div>
            </div>
            <p className="workspaceIntro">上传设计图片并分享链接，快速收集用户反馈</p>
          </div>
          <div className="toolbar">
            {authEnabled && user?.email ? <span className="pill">{user.email}</span> : null}
            {authEnabled ? <LogoutButton /> : <span className="pill">本地 Demo 模式</span>}
          </div>
        </div>

        <div className="workspaceActionRow">
          <Link className="button" href="/new">
            上传 Demo
          </Link>
        </div>

        <section className="dashboardSection" id="demo-list">
          <div className="dashboardSectionHeader">
            <div>
              <div className="sectionCaption">{authEnabled ? "我的 Demo" : "本地 Demo"}</div>
              <p className="sectionDescription">上传后的 Demo 会按卡片形式展示，便于继续分享、查看反馈和删除。</p>
            </div>
          </div>
          <div className="wireGrid">
            {demos.map((demo) => (
              <article className="panel wireCard" key={demo.id}>
                <Link href={`/demos/${demo.shareToken}`}>
                  <div className="wireThumb">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt={demo.title} src={demo.images[0]?.url ?? ""} />
                  </div>
                </Link>
                <div className="wireCardBody">
                  <div className="wireCardTitleRow">
                    <h3>{demo.title}</h3>
                  </div>
                  <p className="wireExcerpt">
                    {demo.description || "点击进入公开体验页，继续收集团队和用户反馈。"}
                  </p>
                </div>
                <div className="wireActionRow">
                  <CopyShareLinkButton
                    defaultLabel="复制分享"
                    url={`${baseUrl}/demos/${demo.shareToken}`}
                    variant="primary"
                  />
                  <Link className="buttonSecondary" href={`/admin/${demo.shareToken}`}>
                    查看反馈
                  </Link>
                  <DeleteDemoButton label="删除项目" shareToken={demo.shareToken} title={demo.title} />
                </div>
              </article>
            ))}

            <Link className="panel wireCreateCard" href="/new">
              <div className="wireCreateIcon">+</div>
              <div>
                <h3>添加 Demo</h3>
              </div>
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
