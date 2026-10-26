"use client";

import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export async function readPdfText(file: File) {
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await getDocument({ data }).promise;
  const pages = Math.min(pdf.numPages, 6);
  const chunks: string[] = [];
  for (let pageNumber = 1; pageNumber <= pages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const lines: { y: number; text: string }[] = [];
    for (const item of content.items) {
      if (!("str" in item) || !item.str) continue;
      const y =
        "transform" in item && Array.isArray(item.transform)
          ? Math.round(Number(item.transform[5]) || 0)
          : 0;
      const last = lines.at(-1);
      if (last && Math.abs(last.y - y) <= 2) {
        last.text += `${last.text.endsWith(" ") ? "" : " "}${item.str}`;
      } else {
        lines.push({ y, text: item.str });
      }
    }
    chunks.push(lines.map((line) => line.text).join("\n"));
  }
  return chunks.join("\n").trim();
}
