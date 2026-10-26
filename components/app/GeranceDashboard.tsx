import Link from "next/link";
import { PurchaseOrderPanel } from "./PurchaseOrderPanel";
import { RequestKindIcon } from "./RequestKindIcon";
import { formatPhotoDate } from "@/lib/photos";
import {
  REQUEST_KIND_LABEL,
  REQUEST_KIND_TEXT,
  REQUEST_KINDS,
  type RequestKind,
} from "@/lib/requests-ui";

export function GeranceDashboard({
  firstName,
  installations,
  requests,
}: {
  firstName: string;
  installations: { id: string; address: string; title: string }[];
  requests: {
    id: string;
    kind: string;
    status: string;
    createdAt: Date;
    installation?: string | null;
  }[];
}) {
  return (
    <div className="max-w-5xl">
      <section className="overflow-hidden rounded-[28px] bg-navy px-6 py-8 text-white sm:px-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/55">
          Espace gérance
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Bonjour {firstName}
        </h1>
        <p className="mt-2 max-w-xl text-[15px] leading-7 text-white/75">
          Consultez vos installations et transmettez une demande à Vertical
          Conseil.
        </p>
      </section>

      <section className="mt-8">
        <PurchaseOrderPanel />
        <h2 className="mt-8 text-xl font-semibold text-navy">
          Faire une demande
        </h2>
        <p className="mt-1 text-[14px] text-muted">
          Sans bon de commande, remplissez un formulaire.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {REQUEST_KINDS.map((kind) => (
            <Link
              key={kind}
              href={`/espace/demandes/nouvelle?type=${kind}`}
              className="group rounded-2xl border border-line bg-white p-5 transition hover:border-brand/40 hover:shadow-[0_16px_40px_rgba(7,29,68,0.06)]"
            >
              <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-soft text-logo">
                <RequestKindIcon kind={kind} />
              </span>
              <h3 className="mt-3 text-[16px] font-semibold text-navy">
                {REQUEST_KIND_LABEL[kind]}
              </h3>
              <p className="mt-1 text-[14px] leading-6 text-muted">
                {REQUEST_KIND_TEXT[kind]}
              </p>
              <span className="mt-3 inline-flex text-[13px] font-semibold text-logo group-hover:underline">
                Ouvrir le formulaire
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-line bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[16px] font-semibold text-navy">
              Installations
            </h2>
            <Link
              href="/espace/installations"
              className="text-[13px] font-semibold text-logo"
            >
              Tout voir
            </Link>
          </div>
          <div className="mt-4 grid gap-2">
            {installations.length ? (
              installations.map((item) => (
                <Link
                  key={item.id}
                  href={`/espace/installations/${item.id}`}
                  className="rounded-xl px-3 py-2.5 hover:bg-soft"
                >
                  <p className="text-[14px] font-semibold text-navy">
                    {item.address || item.title}
                  </p>
                  {item.address && item.title !== item.address ? (
                    <p className="text-[12px] text-muted">{item.title}</p>
                  ) : null}
                </Link>
              ))
            ) : (
              <p className="px-3 py-6 text-[14px] text-muted">
                Aucune installation attribuée pour le moment.
              </p>
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-line bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[16px] font-semibold text-navy">
              Dernières demandes
            </h2>
            <Link
              href="/espace/demandes"
              className="text-[13px] font-semibold text-logo"
            >
              Historique
            </Link>
          </div>
          <div className="mt-4 grid gap-2">
            {requests.length ? (
              requests.map((item) => (
                <div key={item.id} className="rounded-xl px-3 py-2.5">
                  <p className="text-[14px] font-semibold text-navy">
                    {REQUEST_KIND_LABEL[item.kind as RequestKind] ?? item.kind}
                    {item.status === "open" ? (
                      <span className="ml-2 text-[12px] font-semibold text-brand">
                        En cours
                      </span>
                    ) : (
                      <span className="ml-2 text-[12px] font-semibold text-muted">
                        Traitée
                      </span>
                    )}
                  </p>
                  <p className="text-[12px] text-muted">
                    {formatPhotoDate(item.createdAt)}
                    {item.installation ? ` · ${item.installation}` : ""}
                  </p>
                </div>
              ))
            ) : (
              <p className="px-3 py-6 text-[14px] text-muted">
                Aucune demande envoyée.
              </p>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
