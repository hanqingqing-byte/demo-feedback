import Link from "next/link";
import { CreateDemoForm } from "@/components/create-demo-form";
import { requireUser } from "@/lib/auth";

export default async function NewDemoPage() {
  await requireUser();

  return (
    <main className="shell">
      <section className="editorShell">
        <div className="editorTopbar">
          <div className="editorBackRow">
            <Link className="backLink" href="/">
              &lt; Demo Feedback
            </Link>
          </div>
          <div className="toolbar">
            <span className="pill">新建页</span>
          </div>
        </div>

        <div className="editorHeading">
          <h1 className="editorTitle">新建 Demo</h1>
          <p className="muted">填好项目名称、补充说明、上传设计图，然后生成分享链接。</p>
        </div>

        <CreateDemoForm />
      </section>
    </main>
  );
}
