import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { addFeedbackByToken, getPublicDemoByToken } from "@/lib/storage";
import { detectDeviceType } from "@/lib/utils";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  const { shareToken } = await params;
  const demo = await getPublicDemoByToken(shareToken);

  if (!demo) {
    return NextResponse.json({ error: "没有找到对应 Demo。" }, { status: 404 });
  }

  const body = (await request.json()) as { nickname?: string; content?: string };
  const content = body.content?.trim();

  if (!content) {
    return NextResponse.json({ error: "建议内容不能为空。" }, { status: 400 });
  }

  const headerStore = await headers();
  await addFeedbackByToken(shareToken, {
    nickname: body.nickname?.trim() ?? "",
    content,
    deviceType: detectDeviceType(headerStore.get("user-agent"))
  });

  return NextResponse.json({ success: true });
}
