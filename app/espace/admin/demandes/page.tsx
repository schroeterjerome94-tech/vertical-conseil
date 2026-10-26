import Link from "next/link";
import {
  ListFilters,
  UPDATED_SORT_FILTER,
} from "@/components/app/ListFilters";
import { DeleteRequestButton } from "@/components/app/DeleteRequestButton";
import { dateSortDirection } from "@/lib/list-sort";
import { formatPhotoDate } from "@/lib/photos";
import { listAllClientRequests } from "@/lib/requests";
import {
  REQUEST_KIND_LABEL,
  accountCompanyName,
  displayRequestMessage,
  requestAddressFromMessage,
  type RequestKind,
} from "@/lib/requests-ui";
import { requireAdmin } from "@/lib/session";

export default async function AdminDemandesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tri?: string | string[] }>;
}) {
  await requireAdmin();
  const { q, tri } = await searchParams;
  const query = q?.trim().toLowerCase() ?? "";
  const direction = dateSortDirection(tri);
  const requests = (await listAllClientRequests())
    .filter((item) => {
      if (!query) return true;
      return [
        item.account.email,
        item.account.organizationName,
        item.request.kind,
        item.request.message,
        requestAddressFromMessage(item.request.message),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    })
    .sort(
      (a, b) =>
        (new Date(a.request.createdAt).getTime() -
          new Date(b.request.createdAt).getTime()) *
        direction,
    );

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-semibold text-navy">Demandes</h1>
      <p className="mt-2 text-[15px] text-muted">
        Appels d’offres, audits, réparations et questions envoyés par les
        gérances.
      </p>
      <ListFilters
        q={q}
        placeholder="Recherche par société, e-mail ou adresse…"
        groups={[UPDATED_SORT_FILTER]}
        selected={{ tri }}
      />
      <div className="mt-6 grid gap-4">
        {requests.length ? (
          requests.map(({ request, account }) => (
            <article
              key={request.id}
              className="rounded-2xl border border-line bg-white p-6"
            >
              <p className="text-[12px] font-semibold uppercase tracking-wide text-muted">
                {REQUEST_KIND_LABEL[request.kind as RequestKind] ?? request.kind}
                {request.installationId
                  ? " · Fiche créée"
                  : " · En cours"}
              </p>
              <h2 className="mt-1 text-lg font-semibold text-navy">
                {accountCompanyName(account)}
              </h2>
              <p className="mt-1 text-[14px] text-muted">{account.email}</p>
              <p className="mt-1 text-[13px] text-muted">
                {formatPhotoDate(request.createdAt)}
                {requestAddressFromMessage(request.message)
                  ? ` · ${requestAddressFromMessage(request.message)}`
                  : ""}
              </p>
              <p className="mt-4 whitespace-pre-wrap text-[15px] leading-7 text-navy">
                {displayRequestMessage(request.message)}
              </p>
              {request.purchaseOrderStored ? (
                <a
                  href={`/espace/demandes/bon/${request.id}`}
                  className="mt-3 inline-flex text-[14px] font-semibold text-logo"
                >
                  Voir le bon de commande
                  {request.purchaseOrderName
                    ? ` (${request.purchaseOrderName})`
                    : ""}
                </a>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2">
                {request.installationId ? (
                  <Link
                    href={`/espace/admin/installations/${request.installationId}`}
                    className="rounded-full bg-logo px-4 py-2 text-[13px] font-semibold text-white"
                  >
                    Voir la fiche
                  </Link>
                ) : (
                  <Link
                    href={`/espace/admin/installations/nouvelle?demande=${request.id}`}
                    className="rounded-full bg-logo px-4 py-2 text-[13px] font-semibold text-white"
                  >
                    Créer une fiche d’installation
                  </Link>
                )}
                <DeleteRequestButton id={request.id} />
              </div>
            </article>
          ))
        ) : (
          <p className="rounded-2xl border border-line bg-white p-6 text-[14px] text-muted">
            Aucune demande pour le moment.
          </p>
        )}
      </div>
    </div>
  );
}
