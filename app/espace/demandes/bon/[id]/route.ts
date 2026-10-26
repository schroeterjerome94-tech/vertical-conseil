import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { purchaseOrderPath } from "@/lib/purchase-order";
import { getClientRequestById } from "@/lib/requests";
import { getCurrentUser } from "@/lib/session";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const current = await getCurrentUser();
  if (!current || current.user.status !== "approved") {
    return new NextResponse("Non autorisé", { status: 401 });
  }
  const { id } = await params;
  const row = await getClientRequestById(id);
  if (!row?.purchaseOrderStored || !row.purchaseOrderMime) {
    return new NextResponse("Introuvable", { status: 404 });
  }
  const allowed =
    current.user.role === "admin" || current.user.id === row.userId;
  if (!allowed) return new NextResponse("Introuvable", { status: 404 });

  let body: Buffer;
  try {
    body = await readFile(purchaseOrderPath(row.purchaseOrderStored));
  } catch {
    return new NextResponse("Fichier manquant", { status: 404 });
  }

  const filename = encodeURIComponent(row.purchaseOrderName || "bon-de-commande");
  const forceDownload = new URL(request.url).searchParams.get("download") === "1";
  const inline =
    !forceDownload &&
    (row.purchaseOrderMime.startsWith("image/") ||
      row.purchaseOrderMime === "application/pdf");
  return new NextResponse(new Uint8Array(body), {
    headers: {
      "Content-Type": row.purchaseOrderMime,
      "Content-Length": String(body.length),
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${filename}`,
      "Cache-Control": "private, no-store",
    },
  });
}
