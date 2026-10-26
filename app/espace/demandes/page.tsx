import Link from "next/link";
import { RequestKindIcon } from "@/components/app/RequestKindIcon";
import { displayTitle, listInstallationsForUser } from "@/lib/installations";
import { formatPhotoDate } from "@/lib/photos";
import { listRequestsForUser } from "@/lib/requests";
import {
  REQUEST_KIND_LABEL,
  REQUEST_KINDS,
  displayRequestMessage,
  requestAddressFromMessage,
  type RequestKind,
} from "@/lib/requests-ui";
import { requireGerance } from "@/lib/session";

export default async function DemandesPage() {
  const { user } = await requireGerance();
  const rows = await listRequestsForUser(user.id);
  const installations = await listInstallationsForUser({
    role: user.role === "admin" ? "admin" : "gerance",
    userId: user.id,
  });
  const byId = new Map(installations.map((item) => [item.id, item]));

  return (
    <div className="max-w-3xl">
      <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-brand">
        Espace gérance
      </p>
      <h1 className="mt-2 text-3xl font-semibold text-navy">Mes demandes</h1>
      <p className="mt-2 text-[15px] text-muted">
        Appels d’offres, audits, réparations et questions transmis à Vertical
        Conseil.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        {REQUEST_KINDS.map((kind) => (
          <Link
            key={kind}
            href={`/espace/demandes/nouvelle?type=${kind}`}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-white px-4 text-[13px] font-semibold text-navy hover:border-brand"
          >
            <RequestKindIcon kind={kind} className="size-4" />
            {REQUEST_KIND_LABEL[kind]}
          </Link>
        ))}
      </div>
      <div className="mt-6 grid gap-3">
        {rows.length ? (
          rows.map(({ request, installation }) => {
            const item = installation ?? byId.get(request.installationId ?? "");
            const address =
              requestAddressFromMessage(request.message) ||
              (item ? item.buildingAddress || displayTitle(item) : "");
            return (
              <article
                key={request.id}
                className="rounded-2xl border border-line bg-white p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[15px] font-semibold text-navy">
                    {REQUEST_KIND_LABEL[request.kind as RequestKind] ??
                      request.kind}
                  </p>
                  <p className="text-[13px] font-semibold text-muted">
                    {request.status === "open" ? "En cours" : "Traitée"}
                  </p>
                </div>
                <p className="mt-1 text-[13px] text-muted">
                  {formatPhotoDate(request.createdAt)}
                  {address ? ` · ${address}` : ""}
                </p>
                <p className="mt-3 whitespace-pre-wrap text-[15px] leading-7 text-navy">
                  {displayRequestMessage(request.message)}
                </p>
                {request.purchaseOrderStored ? (
                  <a
                    href={`/espace/demandes/bon/${request.id}`}
                    className="mt-3 inline-flex text-[14px] font-semibold text-logo"
                  >
                    Voir le bon de commande
                  </a>
                ) : null}
              </article>
            );
          })
        ) : (
          <p className="rounded-2xl border border-line bg-white p-6 text-[14px] text-muted">
            Aucune demande pour le moment.
          </p>
        )}
      </div>
    </div>
  );
}
