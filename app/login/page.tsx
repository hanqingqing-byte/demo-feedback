import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const authEnabled = isSupabaseConfigured();

  if (authEnabled) {
    const user = await getCurrentUser();

    if (user) {
      redirect("/");
    }
  }

  return (
    <main className="shell">
      <section className="hero">
        <div className="heroCard">
          <span className="eyebrow">Designer Access</span>
          <h1>登录后，才能管理 Demo 和查看反馈。</h1>
          <p>
            公开分享页仍然可以匿名访问，但创建 Demo、删除 Demo、查看反馈后台都需要登录。
          </p>
        </div>
      </section>

      {authEnabled ? (
        <LoginForm />
      ) : (
        <div className="panel">
          <h2>Supabase 还没配置</h2>
          <p className="muted">
            先在项目根目录补齐 `.env.local` 里的 Supabase 配置，再刷新本页即可启用登录权限。
          </p>
        </div>
      )}
    </main>
  );
}
