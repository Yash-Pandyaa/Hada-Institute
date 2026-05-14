import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError, requireUser } from "@/lib/security";
import { getSecurePdfUrl } from "@/lib/storage";

type DownloadParams = {
  params: Promise<{ token: string }>;
};

export async function GET(_request: Request, { params }: DownloadParams) {
  try {
    const session = await requireUser();
    const { token } = await params;
    const access = await prisma.downloadAccess.findUnique({
      where: { token },
      include: { product: true },
    });

    if (!access || access.userId !== session.user.id) {
      return jsonError("Download access not found.", 404);
    }

    if (access.status !== "ACTIVE") {
      return jsonError("Download access is not active.", 403);
    }

    if (access.expiresAt && access.expiresAt < new Date()) {
      return jsonError("Download access has expired.", 403);
    }

    if (access.downloadCount >= access.downloadLimit) {
      return jsonError("Download limit reached.", 403);
    }

    const pdfLocation = access.product.fullPdfKey || access.product.fullPdfUrl;

    if (!pdfLocation) {
      return jsonError("PDF file has not been attached yet.", 404);
    }

    await prisma.downloadAccess.update({
      where: { id: access.id },
      data: {
        downloadCount: { increment: 1 },
        lastDownloadedAt: new Date(),
      },
    });

    return NextResponse.redirect(getSecurePdfUrl(pdfLocation));
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return jsonError("Please sign in to download this file.", 401);
    }

    return jsonError("Unable to create secure download.", 400);
  }
}
