export function formatPhotoDate(value: Date | string) {
  const date = new Date(value);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}.${date.getFullYear()}`;
}

export function isPhotoDocument(item: { kind: string; mimeType?: string }) {
  return item.kind === "photo";
}

export function isPhoto360Item(item: { kind: string; originalName: string }) {
  return (
    item.kind === "photo360" ||
    item.originalName.toLowerCase().endsWith(".insp")
  );
}

export function orderGalleryPhotos<T extends { id: string; createdAt: Date | string }>(
  photos: T[],
  coverPhotoId?: string | null,
) {
  const byDate = [...photos].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  const cover =
    coverPhotoId && byDate.find((item) => item.id === coverPhotoId);
  if (!cover) return byDate;
  return [cover, ...byDate.filter((item) => item.id !== cover.id)];
}
