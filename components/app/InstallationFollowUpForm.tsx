const areaClass =
  "min-h-24 w-full rounded-2xl border border-line px-4 py-3 text-[15px] font-normal outline-none transition focus:border-brand";
const inputClass =
  "h-11 w-full rounded-2xl border border-line px-4 text-[15px] font-normal outline-none transition focus:border-brand";

export function InstallationFollowUpForm({
  action,
  title,
  dateLabel,
  notesLabel,
  submitLabel,
  date,
  notes,
}: {
  action: (formData: FormData) => void | Promise<void>;
  title: string;
  dateLabel: string;
  notesLabel: string;
  submitLabel: string;
  date?: string;
  notes?: string;
}) {
  return (
    <form action={action} className="mt-8 grid gap-6">
      <section className="rounded-2xl border border-line bg-white p-6">
        <h2 className="text-lg font-semibold text-navy">{title}</h2>
        <label className="mt-4 grid gap-2 text-[13px] font-semibold text-navy">
          {dateLabel}
          <input
            type="date"
            name="followUpDate"
            defaultValue={date ?? ""}
            className={inputClass}
          />
        </label>
        <label className="mt-4 grid gap-2 text-[13px] font-semibold text-navy">
          {notesLabel}
          <textarea
            name="followUpNotes"
            defaultValue={notes ?? ""}
            className={areaClass}
          />
        </label>
      </section>
      <button
        type="submit"
        className="inline-flex h-12 w-fit items-center rounded-full bg-logo px-7 text-[15px] font-semibold text-white"
      >
        {submitLabel}
      </button>
    </form>
  );
}
