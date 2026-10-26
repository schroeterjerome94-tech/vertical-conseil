import Link from "next/link";
import { notFound } from "next/navigation";
import { CahierDesCharges } from "@/components/app/CahierDesCharges";
import { ProCtaBanner } from "@/components/app/ProCtaBanner";
import { OfferCompareReport } from "@/components/app/OfferCompareReport";
import { TenderTabs } from "@/components/app/TenderTabs";
import { InstallationMedia } from "@/components/app/InstallationMedia";
import { Photo360Prototype } from "@/components/app/Photo360Prototype";
import { PhotoGallery } from "@/components/app/PhotoGallery";
import { TenderStatusBadge } from "@/components/app/TenderStatusBadge";
import { parseExtraFields } from "@/lib/norms";
import { isPhoto360Item } from "@/lib/photos";
import { filterDocumentsForRole, listDocuments } from "@/lib/documents";
import { OfferContactFields } from "@/components/app/OfferContactFields";
import { PriceWithVat } from "@/components/app/PriceWithVat";
import { formatHtTtc } from "@/lib/money";
import {
  discountsFromProposal,
  formatProposalSummary,
  isOfferComplete,
  parseProposal,
  requiredProposalFields,
} from "@/lib/offer-proposal";
import { userHasAsceProForTender } from "@/lib/asce-pro";
import { getAccountPlan, isPro } from "@/lib/plans";
import { documentsForSpecification } from "@/lib/specification";
import { InstallationCaption } from "@/components/app/InstallationCaption";
import { TenderInfo } from "@/components/app/TenderInfo";
import { getAssignedGeranceContacts } from "@/lib/installations";
import {
  getOwnOffer,
  getTenderById,
  getTenderOffers,
  isTenderOpen,
  userCanViewTender,
} from "@/lib/tenders";
import {
  asceTenderStatusLabel,
  formatDeadline,
  TENDER_STATUS_LABEL,
} from "@/lib/tenders-ui";
import { requireUser } from "@/lib/session";
import { FlashNotice } from "@/components/app/FlashNotice";
import { saveOfferDraftAction, submitOfferAction } from "../actions";

export default async function TenderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    incomplet?: string;
    confirm?: string;
    onglet?: string;
    facture?: string;
  }>;
}) {
  const { user } = await requireUser();
  const { id } = await params;
  const query = await searchParams;
  const allowed = await userCanViewTender(user.role, user.id, id);
  if (!allowed) notFound();
  const row = await getTenderById(id);
  if (!row) notFound();
  const { tender, installation } = row;
  const open = isTenderOpen(tender);
  const { plan } = await getAccountPlan(user.id);
  const pro =
    user.role === "ascensoriste"
      ? await userHasAsceProForTender(user.id, id)
      : isPro(user.role, plan);
  const ownOffer =
    user.role === "ascensoriste" ? await getOwnOffer(id, user.id) : null;
  const offers =
    user.role === "gerance" && pro ? await getTenderOffers(id) : [];
  const [allDocuments, geranceContacts] = await Promise.all([
    listDocuments(installation.id),
    getAssignedGeranceContacts(installation.id),
  ]);
  const documents = filterDocumentsForRole(user.role, pro, allDocuments);
  const installationHref =
    user.role === "gerance"
      ? `/espace/installations/${installation.id}`
      : null;
  const spec = parseExtraFields(installation.extraFields).specification;
  const ownProposal = parseProposal(ownOffer?.proposal);
  const asce = user.role === "ascensoriste";
  const gerance = user.role === "gerance";
  const clauses = spec?.selectedClauses;
  const incomplete =
    query.incomplet === "1" ||
    (Boolean(ownOffer) &&
      !isOfferComplete(ownOffer?.amount, ownProposal, clauses));
  const mediaTab =
    query.onglet === "photo" ||
    query.onglet === "photo360" ||
    query.onglet === "plan" ||
    query.onglet === "document"
      ? query.onglet === "document"
        ? "photo"
        : query.onglet
      : null;
  const tab = mediaTab
    ? mediaTab
    : query.onglet === "info"
      ? "info"
      : gerance && query.onglet === "comparatif"
        ? "comparatif"
        : "cahier";
  const geranceName =
    installation.propertyManagerName?.trim() ||
    geranceContacts[0]?.organizationName?.trim() ||
    geranceContacts[0]?.name?.trim() ||
    "";
  const plans = documents.filter((item) => item.kind === "plan");
  const transmitted = documentsForSpecification(documents, spec);
  const photos360 = transmitted.filter(isPhoto360Item);
  const photos = transmitted.filter((item) => item.kind === "photo");
  const videos = transmitted.filter((item) => item.kind === "video");

  return (
    <div className={asce ? "max-w-4xl" : "max-w-6xl"}>
      {query.incomplet === "1" ? (
        <FlashNotice
          message="Offre incomplète. Tous les champs doivent être remplis."
          fieldNames={["amount", ...requiredProposalFields(clauses)]}
        />
      ) : null}
      {query.facture === "1" ? (
        <FlashNotice
          tone="success"
          message="Accès ouvert. Une facture vous parviendra par e-mail, payable à 30 jours."
        />
      ) : null}
      {query.facture === "deja" ? (
        <FlashNotice
          tone="success"
          message="Les données de ce cahier des charges sont déjà débloquées."
        />
      ) : null}
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand print:hidden">
        Appel d’offres
      </p>
      <div className="print:hidden">
        <InstallationCaption
          as="h1"
          address={installation.buildingAddress}
          reference={installation.internalRef}
        />
      </div>
      <p className="mt-2 flex flex-wrap items-center gap-2 text-[14px] text-muted print:hidden">
        <span>{formatDeadline(tender.deadline)}</span>
        <TenderStatusBadge
          label={
            asce
              ? asceTenderStatusLabel(
                  tender,
                  ownOffer?.id,
                  ownProposal.acknowledged === "oui",
                )
              : (TENDER_STATUS_LABEL[tender.status] ?? tender.status)
          }
        />
      </p>
      {installationHref ? (
        <Link
          href={installationHref}
          className="mt-4 inline-flex text-[14px] font-semibold text-logo print:hidden"
        >
          Voir la fiche installation
        </Link>
      ) : null}

      <TenderTabs
        href={`/espace/appels-doffres/${id}`}
        current={tab}
        tabs={
          asce
            ? [
                { id: "info", label: "Information" },
                { id: "photo", label: "Photos" },
                { id: "photo360", label: "360°" },
                { id: "plan", label: "Plans" },
                { id: "cahier", label: "Cahier des charges" },
              ]
            : [
                { id: "info", label: "Information" },
                { id: "photo", label: "Photos" },
                { id: "photo360", label: "360°" },
                { id: "plan", label: "Plans" },
                { id: "cahier", label: "Cahier des charges" },
                { id: "comparatif", label: "Comparatif" },
              ]
        }
      />

      {tab === "info" ? (
        <TenderInfo
          owner={installation.ownerName}
          gerance={geranceName}
          access={installation.buildingAccess}
          deadline={formatDeadline(tender.deadline)}
          notes={spec?.importantNotes}
        />
      ) : null}

      {(asce || gerance) &&
      (tab === "photo" || tab === "photo360" || tab === "plan") ? (
        <div className="mt-8 print:hidden">
          {tab === "photo360" ? (
            <div className="grid gap-6">
              <Photo360Prototype
                photos={photos360}
                locked={!pro}
                asce={asce}
              />
              {pro ? (
                videos.length ? (
                  <InstallationMedia
                    installationId={installation.id}
                    documents={videos}
                    canEdit={false}
                    kinds={["video"]}
                    asce={asce}
                  />
                ) : null
              ) : (
                <InstallationMedia
                  installationId={installation.id}
                  documents={[]}
                  canEdit={false}
                  kinds={["video"]}
                  lockedKinds={["video"]}
                  asce={asce}
                />
              )}
            </div>
          ) : tab === "photo" ? (
            pro ? (
              <PhotoGallery
                photos={photos}
                coverPhotoId={
                  parseExtraFields(installation.extraFields).coverPhotoId
                }
              />
            ) : (
              <InstallationMedia
                installationId={installation.id}
                documents={[]}
                canEdit={false}
                kinds={["photo"]}
                lockedKinds={["photo"]}
                asce={asce}
              />
            )
          ) : (
            <InstallationMedia
              installationId={installation.id}
              documents={plans}
              canEdit={false}
              kinds={["plan"]}
              lockedKinds={pro ? [] : ["plan"]}
              asce={asce}
            />
          )}
        </div>
      ) : null}

      {asce && !pro && tab === "cahier" ? (
        <div className="mt-8">
          <ProCtaBanner tenderId={id} />
        </div>
      ) : null}

      {asce && open && tab === "cahier" ? (
        <form action={submitOfferAction.bind(null, id)} className="mt-8 grid gap-6">
          <CahierDesCharges
            installation={installation}
            spec={spec}
            documents={documents}
            fill
            proposal={ownProposal}
            incomplete={incomplete}
            pro={pro}
            proCta={asce}
          />
          <section className="rounded-2xl border border-line bg-white p-6 print:hidden">
            <h2 className="text-lg font-semibold text-navy">Montant</h2>
            {ownOffer ? (
              <p className="mt-2 text-[14px] text-muted">
                Offre enregistrée. Vous pouvez encore la modifier.
              </p>
            ) : null}
            <div className="mt-4">
              <PriceWithVat
                name="amount"
                defaultValue={ownOffer?.amount ?? ""}
                label="Prix HT (CHF)"
                emptyRed={incomplete}
                discounts
                defaultRabais={ownProposal.rabaisPct}
                defaultEscompte={ownProposal.escomptePct}
                defaultProrata={ownProposal.prorataPct}
                defaultArrondi={ownProposal.arrondiHt}
              />
            </div>
          </section>
          <OfferContactFields
            proposal={ownProposal}
            fill
            emptyRed={incomplete}
          />
          <section className="rounded-2xl border border-line bg-white p-6 print:hidden">
            <label
              className={`flex cursor-pointer items-start gap-3 text-[14px] leading-6 ${
                query.confirm === "1" ? "font-semibold text-red-600" : "text-navy"
              }`}
            >
              <input
                type="checkbox"
                name="confirmIndications"
                value="oui"
                className="mt-1 size-4 shrink-0"
              />
              <span>
                Je reconnais les indications du cahier des charges et je
                confirme les informations de cette offre.
              </span>
            </label>
            {query.confirm === "1" ? (
              <p className="mt-2 text-[13px] font-semibold text-red-600">
                Cochez la case pour confirmer avant de soumettre.
              </p>
            ) : null}
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="submit"
                formAction={saveOfferDraftAction.bind(null, id)}
                className="inline-flex h-12 items-center rounded-full border border-line px-6 text-[15px] font-semibold text-navy"
              >
                Enregistrer
              </button>
              <button
                type="submit"
                className="inline-flex h-12 items-center rounded-full bg-logo px-7 text-[15px] font-semibold text-white"
              >
                {isOfferComplete(ownOffer?.amount, ownProposal, clauses)
                  ? "Mettre à jour l’offre"
                  : "Soumettre l’offre"}
              </button>
            </div>
          </section>
        </form>
      ) : (
        <>
          {!asce && tab === "cahier" ? (
          <div className="mt-8 max-w-4xl">
            <CahierDesCharges
              installation={installation}
              spec={spec}
              documents={documents}
              fill={false}
              proposal={ownProposal}
              pro={pro}
            />
          </div>
          ) : null}
          {asce && tab === "cahier" ? (
            <>
          <div className="mt-8 max-w-4xl">
            <CahierDesCharges
              installation={installation}
              spec={spec}
              documents={documents}
              fill={false}
              proposal={ownProposal}
              pro={pro}
              proCta={asce}
            />
          </div>
            <section className="mt-6 max-w-4xl rounded-2xl border border-line bg-white p-6 print:hidden">
              <h2 className="text-lg font-semibold text-navy">Votre offre</h2>
              <p className="mt-3 text-[15px] text-muted">
                {ownOffer
                  ? tender.awardedOfferId === ownOffer.id
                    ? `Votre offre a été retenue (${formatHtTtc(ownOffer.amount, discountsFromProposal(ownProposal))}).`
                    : tender.status === "awarded"
                      ? `Offre transmise : ${formatHtTtc(ownOffer.amount, discountsFromProposal(ownProposal))}. Une autre offre a été retenue.`
                      : `Offre transmise : ${formatHtTtc(ownOffer.amount, discountsFromProposal(ownProposal))}. La consultation est close.`
                  : "Cette consultation n’accepte plus de soumissions."}
              </p>
              {ownOffer ? (
                <p className="mt-2 text-[14px] text-navy">
                  {formatProposalSummary(ownOffer.proposal)}
                </p>
              ) : null}
            </section>
            <div className="mt-6 max-w-4xl">
              <OfferContactFields proposal={ownProposal} fill={false} />
            </div>
            </>
          ) : tab === "comparatif" ? (
            pro ? (
            <OfferCompareReport
              offers={offers}
              selectedClauses={spec?.selectedClauses}
              awardedOfferId={tender.awardedOfferId}
              existing={installation}
            />
            ) : (
            <p className="mt-6 text-[14px] text-muted print:hidden">
              Le comparatif des offres fait partie de l’abonnement Pro.{" "}
              <Link href="/espace/formule" className="font-semibold text-logo">
                Voir la formule
              </Link>
            </p>
            )
          ) : null}
        </>
      )}
    </div>
  );
}
