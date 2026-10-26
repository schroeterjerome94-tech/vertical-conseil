export function displayAddress(item: {
  buildingAddress?: string | null;
}) {
  return item.buildingAddress?.trim() || "Installation sans adresse";
}

export function displayReference(item: { internalRef?: string | null }) {
  return item.internalRef?.trim() || "";
}
