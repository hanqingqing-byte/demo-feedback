import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { createDemoWithImages } from "@/lib/storage";

export async function POST(request: Request) {
  const user = isSupabaseConfigured() ? await requireUser() : null;
  const formData = await request.formData();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const imageFiles = formData.getAll("images").filter((item): item is File => item instanceof File);

  if (!title) {
    return NextResponse.json({ error: "标题不能为空。" }, { status: 400 });
  }

  if (imageFiles.length === 0) {
    return NextResponse.json({ error: "请至少上传一张图片。" }, { status: 400 });
  }

  const demo = await createDemoWithImages({
    creatorId: user?.id,
    title,
    description,
    imageFiles
  });

  return NextResponse.json({
    shareToken: demo.shareToken
  });
}
