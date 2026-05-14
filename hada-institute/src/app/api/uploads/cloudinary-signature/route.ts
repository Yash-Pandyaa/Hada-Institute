import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security";
import { signUploadParams } from "@/lib/storage";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = (await request.json()) as { folder?: string };
    const folder = body.folder || "hada-institute/uploads";

    return NextResponse.json(signUploadParams(folder));
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 },
    );
  }
}
