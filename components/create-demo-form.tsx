"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBaseUrl } from "@/lib/utils";

type PreviewImage = {
  name: string;
  url: string;
};

export function CreateDemoForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<PreviewImage[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [createdShareToken, setCreatedShareToken] = useState("");
  const hasPreviews = previews.length > 0;

  useEffect(() => {
    const nextPreviews = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file)
    }));

    setPreviews(nextPreviews);

    return () => {
      nextPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [files]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("请先填写 Demo 标题。");
      return;
    }

    if (files.length === 0) {
      setError("请至少上传一张设计图。");
      return;
    }

    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      files.forEach((file) => formData.append("images", file));

      const response = await fetch("/api/demos", {
        method: "POST",
        body: formData
      });

      const payload = (await response.json()) as { error?: string; shareToken?: string };

      if (!response.ok || !payload.shareToken) {
        throw new Error(payload.error ?? "保存失败，请稍后重试。");
      }

      setCreatedShareToken(payload.shareToken);
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? submissionError.message : "保存失败，请稍后重试。"
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <form className="panel editorForm" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="title">项目名称 *</label>
          <input
            id="title"
            placeholder="例如：外卖首页改版 V1"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="description">Demo 描述</label>
          <textarea
            id="description"
            placeholder="补充这版想重点收集什么反馈，比如首屏信息层级、下单路径是否顺。"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="images">上传设计图</label>
          {hasPreviews ? (
            <div className="editorThumbGrid">
              {previews.map((preview, index) => (
                <div className="thumb thumbWithBadge" key={preview.url}>
                  <span className="thumbBadge">{index + 1}</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt={preview.name} src={preview.url} />
                </div>
              ))}
              <label className="uploadTile uploadTileInline" htmlFor="images">
                <div className="uploadTileIcon">↑</div>
                <div>点击上传</div>
              </label>
            </div>
          ) : (
            <label className="uploadBox uploadBoxEmpty" htmlFor="images">
              <div className="uploadBoxEmptyInner">
                <div className="uploadTileIcon">↑</div>
                <div className="uploadBoxTitle">点击上传</div>
              </div>
            </label>
          )}

          <input
            className="uploadInput uploadInputHidden"
            id="images"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
          />
          <p className="hint">支持 PNG、JPG、WEBP，多图会按你选择的顺序展示。</p>
        </div>

        {error ? <div className="emptyState">{error}</div> : null}

        <div className="editorActionBar">
          <button className="buttonSecondary" onClick={() => router.push("/")} type="button">
            取消
          </button>
          <button className="button" disabled={isSaving} type="submit">
            {isSaving ? "生成中..." : "完成并生成链接"}
          </button>
        </div>
      </form>

      {createdShareToken ? (
        <div className="modalOverlay">
          <div className="modalCard">
            <button className="modalClose" onClick={() => setCreatedShareToken("")} type="button">
              ×
            </button>
            <span className="pill">创建成功</span>
            <h3 className="panelTitle" style={{ marginTop: 12 }}>
              点击复制链接发分享吧
            </h3>
            <p className="muted">链接已经生成完成。先复制分享链接，再发到群里或 IM 对话中。</p>
            <div className="modalPrimaryActions">
              <button
                className="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(`${getBaseUrl()}/demos/${createdShareToken}`);
                }}
                type="button"
              >
                复制分享链接
              </button>
            </div>
            <div className="toolbar modalFooterActions">
              <button className="buttonSecondary" onClick={() => router.push("/")} type="button">
                返回首页
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
