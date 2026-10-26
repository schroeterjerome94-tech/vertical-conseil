function stripUnit(value: string) {
  return value.replace(/\s*mm\s*$/i, "").trim();
}

export function parseMm(value: string | null | undefined) {
  if (!value) return null;
  const match = stripUnit(value).replace(",", ".").match(/[\d.]+/);
  if (!match) return null;
  const number = Number(match[0]);
  return Number.isFinite(number) && number > 0 ? number : null;
}

export function formatLxP(
  width?: string | null,
  depth?: string | null,
) {
  const w = width?.trim() ? stripUnit(width.trim()) : "";
  const d = depth?.trim() ? stripUnit(depth.trim()) : "";
  if (w && d) return `${w} x ${d} mm (LxP)`;
  if (w) return `${w} mm (L)`;
  if (d) return `${d} mm (P)`;
  return null;
}

export function formatLxH(
  width?: string | null,
  height?: string | null,
) {
  const w = width?.trim() ? stripUnit(width.trim()) : "";
  const h = height?.trim() ? stripUnit(height.trim()) : "";
  if (w && h) return `${w} x ${h} mm (LxH)`;
  if (w) return `${w} mm (L)`;
  if (h) return `${h} mm (H)`;
  return null;
}

export function formatAreaM2(
  width?: string | null,
  depth?: string | null,
) {
  const w = parseMm(width);
  const d = parseMm(depth);
  if (w == null || d == null) return null;
  const area = (w * d) / 1_000_000;
  return `${area.toLocaleString("fr-CH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} m²`;
}
