export function dateSortDirection(sort?: string | string[]) {
  const value = (Array.isArray(sort) ? sort : sort ? [sort] : []).at(-1);
  return value === "croissante" ? 1 : -1;
}
