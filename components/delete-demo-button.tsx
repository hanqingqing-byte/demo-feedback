"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteDemoButton({
  shareToken,
  title,
  redirectToHome = false
}: {
  shareToken: string;
  title: string;
  redirectToHome?: boolean;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(`确认删除「${title}」吗？删除后图片和反馈都会一起移除。`);

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/demos/${shareToken}`, {
        method: "DELETE"
      });

      const payload = (await response.json()) as { error?: string; success?: boolean };

      if (!response.ok || !payload.success) {
        throw new Error(payload.error ?? "删除失败，请稍后重试。");
      }

      if (redirectToHome) {
        router.push("/");
      }

      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "删除失败，请稍后重试。");
      setIsDeleting(false);
    }
  }

  return (
    <button className="buttonDanger" disabled={isDeleting} onClick={handleDelete} type="button">
      {isDeleting ? "删除中..." : "删除 Demo"}
    </button>
  );
}
