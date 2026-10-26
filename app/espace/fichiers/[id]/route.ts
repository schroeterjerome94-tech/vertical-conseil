import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { documentPath, getDocumentById, userCanAccessDocument } from "@/lib/documents";
import { getCurrentUser } from "@/lib/session";

function streamFile(path: string, start?: number, end?: number) {
  const node =
    start == null
      ? createReadStream(path)
      : createReadStream(path, { start, end });
  return Readable.toWeb(node) as ReadableStream<Uint8Array>;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const current = await getCurrentUser();
  if (!current || current.user.status !== "approved") {
    return new NextResponse("Non autorisé", { status: 401 });
  }
  const { id } = await params;
  const row = await getDocumentById(id);
  if (!row) return new NextResponse("Introuvable", { status: 404 });
  const allowed = await userCanAccessDocument(
    current.user.role,
    current.user.id,
    row.installationId,
    row.kind,
    row.mimeType,
  );
  if (!allowed) return new NextResponse("Introuvable", { status: 404 });

  const filePath = documentPath(row.storedName);
  let size: number;
  try {
    size = (await stat(filePath)).size;
  } catch {
    return new NextResponse("Fichier manquant", { status: 404 });
  }

  const filename = encodeURIComponent(row.originalName);
  const forceDownload = new URL(request.url).searchParams.get("download") === "1";
  const inline =
    !forceDownload &&
    (row.mimeType.startsWith("image/") ||
      row.mimeType.startsWith("video/") ||
      row.mimeType === "application/pdf");
  const headers: Record<string, string> = {
    "Content-Type": row.mimeType,
    "Accept-Ranges": "bytes",
    "Content-Disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${filename}`,
    "Cache-Control": "private, no-store",
  };

  const range = inline ? request.headers.get("range") : null;
  const match = range?.match(/bytes=(\d*)-(\d*)/);
  if (match) {
    const start = match[1] ? Number(match[1]) : 0;
    const end = match[2] ? Number(match[2]) : size - 1;
    if (
      !Number.isFinite(start) ||
      !Number.isFinite(end) ||
      start < 0 ||
      end < start ||
      start >= size
    ) {
      return new NextResponse("Plage invalide", {
        status: 416,
        headers: { "Content-Range": `bytes */${size}` },
      });
    }
    const last = Math.min(end, size - 1);
    headers["Content-Length"] = String(last - start + 1);
    headers["Content-Range"] = `bytes ${start}-${last}/${size}`;
    return new NextResponse(streamFile(filePath, start, last), {
      status: 206,
      headers,
    });
  }

  headers["Content-Length"] = String(size);
  return new NextResponse(streamFile(filePath), { headers });
}
