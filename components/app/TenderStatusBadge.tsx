import { tenderStatusClass } from "@/lib/tenders-ui";

export function TenderStatusBadge({ label }: { label: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${tenderStatusClass(label)}`}
    >
      {label}
    </span>
  );
}
