export const DOCUMENT_KINDS = [
  { value: "plan", label: "Plan" },
  { value: "photo", label: "Photo" },
  { value: "video", label: "Vidéo 360°" },
  { value: "photo360", label: "Photo 360°" },
  { value: "releve", label: "Relevé" },
  { value: "rapport", label: "Rapport" },
  { value: "autre", label: "Autre" },
] as const;

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  if (bytes >= 1024 * 1024 * 1024) {
    const go = bytes / (1024 * 1024 * 1024);
    return `${go.toFixed(go >= 10 ? 0 : 1).replace(/\.0$/, "")} Go`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, "")} Mo`;
}

export function formatSizeLimit(bytes: number) {
  if (bytes >= 1024 * 1024 * 1024) {
    return `${Math.round(bytes / (1024 * 1024 * 1024))} Go`;
  }
  return `${Math.round(bytes / (1024 * 1024))} Mo`;
}

export function kindLabel(kind: string) {
  return DOCUMENT_KINDS.find((item) => item.value === kind)?.label ?? "Autre";
}

export function maxBytesForKind(kind: string) {
  if (kind === "video") return 16 * 1024 * 1024 * 1024;
  if (kind === "photo360") return 80 * 1024 * 1024;
  return 20 * 1024 * 1024;
}

export function acceptForKind(kind: string) {
  if (kind === "plan") return ".pdf,.dwg,application/pdf";
  if (kind === "video") return ".mp4,video/mp4";
  if (kind === "photo360") {
    return ".insp,.jpg,.jpeg,.png,image/jpeg,image/png";
  }
  if (kind === "photo") {
    return ".jpg,.jpeg,.png,image/jpeg,image/png";
  }
  return ".pdf,.jpg,.jpeg,.png,.dwg,application/pdf,image/jpeg,image/png";
}

export function hintForKind(kind: string) {
  if (kind === "plan") return "PDF ou DWG · 20 Mo maximum.";
  if (kind === "video") return "MP4 360° · 16 Go maximum.";
  if (kind === "photo360") return "INSP (Insta360), JPG ou PNG · 80 Mo maximum.";
  if (kind === "photo") return "JPG ou PNG · 20 Mo maximum.";
  return "PDF, JPG, PNG ou DWG · 20 Mo maximum.";
}
