"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");

    if (!email.trim()) {
      setStatus("请输入邮箱地址。");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=/`;
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: redirectTo
        }
      });

      if (error) {
        throw error;
      }

      setStatus("登录链接已发送到邮箱，请在收件箱里点击继续登录。");
      setEmail("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "发送登录链接失败，请稍后再试。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="panel formGrid" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="email">邮箱地址</label>
        <input
          id="email"
          placeholder="designer@company.com"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      {status ? <div className="emptyState">{status}</div> : null}

      <div className="toolbar">
        <button className="button" disabled={isSubmitting} type="submit">
          {isSubmitting ? "发送中..." : "发送魔法登录链接"}
        </button>
      </div>
    </form>
  );
}
