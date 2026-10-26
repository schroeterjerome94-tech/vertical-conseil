import {
  DATE_SORT_FILTER,
  ListFilters,
  WORK_TYPE_FILTER,
} from "./ListFilters";

export function TenderFilters({
  q,
  workTypes,
  sort,
}: {
  q?: string;
  workTypes?: string | string[];
  sort?: string | string[];
}) {
  return (
    <ListFilters
      q={q}
      placeholder="Recherche par adresse, référence ou type de travaux…"
      groups={[WORK_TYPE_FILTER, DATE_SORT_FILTER]}
      selected={{ travaux: workTypes, tri: sort }}
    />
  );
}
