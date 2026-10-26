import { notFound } from "next/navigation";
import { ServiceRequestForm } from "@/components/app/ServiceRequestForm";
import {
  isRequestKind,
  REQUEST_KIND_FEES,
  REQUEST_KIND_LABEL,
  REQUEST_KIND_STEPS,
  REQUEST_KIND_TEXT,
} from "@/lib/requests-ui";
import { requireGerance } from "@/lib/session";

export default async function NouvelleDemandePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { user } = await requireGerance();
  const { type } = await searchParams;
  if (!type || !isRequestKind(type)) notFound();

  return (
    <div className="max-w-xl">
      <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-brand">
        Nouvelle demande
      </p>
      <h1 className="mt-2 text-3xl font-semibold text-navy">
        {REQUEST_KIND_LABEL[type]}
      </h1>
      <p className="mt-2 text-[15px] leading-7 text-muted">
        {REQUEST_KIND_TEXT[type]}
      </p>
      <div className="mt-6">
        <h2 className="text-[16px] font-semibold text-navy">Procédure</h2>
        <ol className="mt-3 grid gap-2">
          {REQUEST_KIND_STEPS[type].map((step, index) => (
            <li
              key={step}
              className="flex gap-3 text-[15px] leading-6 text-muted"
            >
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-white text-[12px] font-semibold text-navy ring-1 ring-line">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
        <p className="mt-4 text-[15px] leading-7 text-navy">
          {REQUEST_KIND_FEES[type]}
        </p>
      </div>
      <ServiceRequestForm
        kind={type}
        organization={user.organizationName?.trim() || ""}
      />
    </div>
  );
}
