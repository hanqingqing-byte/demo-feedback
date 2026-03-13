import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { deleteDemoByToken } from "@/lib/storage";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  const { shareToken } = await params;
  const user = isSupabaseConfigured() ? await requireUser() : null;
  const deleted = await deleteDemoByToken(shareToken, user?.id);

  if (!deleted) {
    return NextResponse.json({ error: "没有找到可删除的 Demo。" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
