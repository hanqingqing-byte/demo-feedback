"use client";

import { useState } from "react";

export function FeedbackForm({ shareToken }: { shareToken: string }) {
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    if (!content.trim()) {
      setStatus({
        type: "error",
        message: "建议内容不能为空。"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/demos/${shareToken}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nickname,
          content
        })
      });

      const payload = (await response.json()) as { error?: string; success?: boolean };

      if (!response.ok || !payload.success) {
        throw new Error(payload.error ?? "提交失败，请稍后重试。");
      }

      setNickname("");
      setContent("");
      setStatus({
        type: "success",
        message: "提交成功，设计师已经能在后台看到这条建议了。"
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "提交失败，请稍后重试。"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="panel feedbackWireForm" id="feedback-form" onSubmit={handleSubmit}>
      <div className="feedbackFormHead">
        <h2 className="panelTitle">请提交你的建议：</h2>
      </div>

      <div className="field">
        <input
          id="nickname"
          placeholder="输入你的昵称"
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
        />
      </div>

      <div className="field">
        <textarea
          id="content"
          placeholder="你的建议，互评时为方便，带上你觉得哪里有问题。"
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
      </div>

      <div className="feedbackSubmitRow">
        <span className="hint">建议会立即回收到设计师后台，不会出现在公开页上。</span>
        <button className="button" disabled={isSubmitting} type="submit">
          {isSubmitting ? "提交中..." : "提交反馈"}
        </button>
      </div>

      {status ? <div className={`toast ${status.type}`}>{status.message}</div> : null}
    </form>
  );
}
