import { notFound } from "next/navigation";
import { FeedbackForm } from "@/components/feedback-form";
import { getPublicDemoByToken } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function DemoViewerPage({
  params
}: {
  params: Promise<{ shareToken: string }>;
}) {
  const { shareToken } = await params;
  const demo = await getPublicDemoByToken(shareToken);

  if (!demo) {
    notFound();
  }

  return (
    <main className="viewerShell">
      <section className="viewerWireframe">
        <div className="viewerTopbar viewerTopbarCompact">
          <div className="topbarBrand">
            <div className="brandMeta">
              <div className="brandTitle">Demo Feedback</div>
              <div className="brandSubtitle">上传设计图并分享链接，快速收集用户反馈</div>
            </div>
          </div>
        </div>

        <div className="viewerWireHeader">
          <h1>{demo.title}</h1>
          {demo.description ? <p>{demo.description}</p> : null}
        </div>

        <div className="viewerGalleryShell">
          <div className="viewerGalleryRow">
            {demo.images.map((image) => (
              <div className="viewerImage viewerImageCompact" key={image.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt={demo.title} src={image.url} />
              </div>
            ))}
          </div>
          <div className="viewerProgress">
            <span className="viewerProgressActive" />
          </div>
        </div>

        <section className="feedbackPanel feedbackPanelInline">
          <FeedbackForm shareToken={shareToken} />
        </section>
      </section>
    </main>
  );
}
