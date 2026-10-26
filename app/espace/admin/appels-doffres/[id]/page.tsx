import Link from "next/link";
import { CahierDesCharges } from "@/components/app/CahierDesCharges";
import { OfferCompareReport } from "@/components/app/OfferCompareReport";
import { TenderTabs } from "@/components/app/TenderTabs";
import { TenderStatusBadge } from "@/components/app/TenderStatusBadge";
import { notFound } from "next/navigation";
import { parseExtraFields } from "@/lib/norms";
import { InstallationCaption } from "@/components/app/InstallationCaption";
import {
  getTenderById,
  getTenderInvites,
  getTenderOffers,
  listAscensoristeAccounts,
} from "@/lib/tenders";
import { formatDeadline, TENDER_STATUS_LABEL } from "@/lib/tenders-ui";
import { requireAdmin } from "@/lib/session";
import { listDocuments } from "@/lib/documents";
import { TenderInfo } from "@/components/app/TenderInfo";
import { getAssignedGeranceContacts } from "@/lib/installations";
import {
  addInvitesAction,
  awardTenderAction,
  closeTenderAction,
} from "../actions";

export default async function AdminTenderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ onglet?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { onglet } = await searchParams;
  const tab =
    onglet === "comparatif" ? "comparatif" : onglet === "info" ? "info" : "cahier";
  const row = await getTenderById(id);
  if (!row) notFound();
  const { tender, installation } = row;
  const [invites, offers, companies, documents, geranceContacts] =
    await Promise.all([
      getTenderInvites(id),
      getTenderOffers(id),
      listAscensoristeAccounts(),
      listDocuments(installation.id),
      getAssignedGeranceContacts(installation.id),
    ]);
  const invitedIds = new Set(invites.map((item) => item.userId));
  const extraCompanies = companies.filter((item) => !invitedIds.has(item.id));
  const spec = parseExtraFields(installation.extraFields).specification;

  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-4 print:hidden">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">
            Appel d’offres
          </p>
          <InstallationCaption
            as="h1"
            address={installation.buildingAddress}
            reference={installation.internalRef}
          />
          <p className="mt-2 flex flex-wrap items-center gap-2 text-[14px] text-muted">
            <span>{formatDeadline(tender.deadline)}</span>
            <TenderStatusBadge
              label={TENDER_STATUS_LABEL[tender.status] ?? tender.status}
            />
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/espace/admin/installations/${installation.id}`}
            className="inline-flex h-11 items-center rounded-full border border-line px-5 text-[14px] font-semibold text-navy"
          >
            Fiche installation
          </Link>
          {tender.status === "open" ? (
            <form
              action={async () => {
                "use server";
                await closeTenderAction(id);
              }}
            >
              <button
                type="submit"
                className="inline-flex h-11 items-center rounded-full bg-logo px-5 text-[14px] font-semibold text-white"
              >
                Clôturer
              </button>
            </form>
          ) : null}
        </div>
      </div>

      <TenderTabs
        href={`/espace/admin/appels-doffres/${id}`}
        current={tab}
        tabs={[
          { id: "info", label: "Information" },
          { id: "cahier", label: "Cahier des charges" },
          { id: "comparatif", label: "Comparatif" },
        ]}
        editHref={`/espace/admin/installations/${installation.id}/cahier-des-charges?retour=${encodeURIComponent(`/espace/admin/appels-doffres/${id}`)}`}
      />

      {tab === "info" ? (
        <div className="max-w-4xl">
          <TenderInfo
            owner={installation.ownerName}
            gerance={
              installation.propertyManagerName?.trim() ||
              geranceContacts[0]?.organizationName?.trim() ||
              geranceContacts[0]?.name?.trim() ||
              ""
            }
            access={installation.buildingAccess}
            deadline={formatDeadline(tender.deadline)}
            notes={spec?.importantNotes}
          />
        </div>
      ) : null}

      {tab === "cahier" ? (
        <>
      <div className="mt-8 max-w-4xl">
        <CahierDesCharges
          installation={installation}
          spec={spec}
          documents={documents}
        />
      </div>

      <section className="mt-6 max-w-4xl rounded-2xl border border-line bg-white p-6 print:hidden">
        <h2 className="text-lg font-semibold text-navy">Entreprises invitées</h2>
        <ul className="mt-3 grid gap-2 text-[14px] text-navy">
          {invites.map((item) => (
            <li key={item.id}>
              {item.name}
              {item.organizationName ? ` · ${item.organizationName}` : ""}
            </li>
          ))}
        </ul>
        {tender.status === "open" && extraCompanies.length ? (
          <form
            action={addInvitesAction.bind(null, id)}
            className="mt-5 grid gap-2 border-t border-line pt-5"
          >
            <p className="text-[14px] font-semibold text-navy">
              Inviter d’autres entreprises
            </p>
            {extraCompanies.map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-3 rounded-xl border border-line px-4 py-3 text-[14px]"
              >
                <input type="checkbox" name="inviteeIds" value={item.id} />
                <span>
                  <span className="font-semibold text-navy">{item.name}</span>
                  <span className="block text-[13px] text-muted">
                    {item.organizationName ? `${item.organizationName} · ` : ""}
                    {item.email}
                  </span>
                </span>
              </label>
            ))}
            <button
              type="submit"
              className="mt-2 inline-flex h-11 w-fit items-center rounded-full bg-logo px-5 text-[14px] font-semibold text-white"
            >
              Envoyer les invitations
            </button>
          </form>
        ) : null}
      </section>
        </>
      ) : (
      <OfferCompareReport
        offers={offers}
        selectedClauses={spec?.selectedClauses}
        awardedOfferId={tender.awardedOfferId}
        existing={installation}
        awardAction={
          tender.awardedOfferId
            ? undefined
            : (offerId) => (
                <form
                  action={async () => {
                    "use server";
                    await awardTenderAction(id, offerId);
                  }}
                >
                  <button
                    type="submit"
                    className="text-[13px] font-semibold text-logo"
                  >
                    Retenir
                  </button>
                </form>
              )
        }
      />
      )}
    </div>
  );
}
