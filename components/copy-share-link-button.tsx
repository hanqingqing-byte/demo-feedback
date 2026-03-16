"use client";

import { useState } from "react";

export function CopyShareLinkButton({
  url,
  variant = "secondary",
  defaultLabel = "复制分享链接",
  copiedLabel = "已复制链接"
}: {
  url: string;
  variant?: "primary" | "secondary";
  defaultLabel?: string;
  copiedLabel?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.prompt("复制这个分享链接", url);
    }
  }

  return (
    <button
      className={variant === "primary" ? "button" : "buttonSecondary"}
      onClick={handleCopy}
      type="button"
    >
      {copied ? copiedLabel : defaultLabel}
    </button>
  );
}
