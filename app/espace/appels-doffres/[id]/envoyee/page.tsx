import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isOfferComplete, parseProposal } from "@/lib/offer-proposal";
import { parseExtraFields } from "@/lib/norms";
import {
  getOwnOffer,
  getTenderById,
  isTenderOpen,
  userCanViewTender,
} from "@/lib/tenders";
import { formatDeadline } from "@/lib/tenders-ui";
import { requireAscensoriste } from "@/lib/session";

export default async function OfferSentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await requireAscensoriste();
  const { id } = await params;
  const allowed = await userCanViewTender(user.role, user.id, id);
  if (!allowed) notFound();
  const row = await getTenderById(id);
  if (!row) notFound();
  const ownOffer = await getOwnOffer(id, user.id);
  const spec = parseExtraFields(row.installation.extraFields).specification;
  const complete = isOfferComplete(
    ownOffer?.amount,
    parseProposal(ownOffer?.proposal),
    spec?.selectedClauses,
  );
  if (!ownOffer || !complete) {
    redirect(`/espace/appels-doffres/${id}`);
  }

  const open = isTenderOpen(row.tender);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col justify-center md:min-h-[calc(100vh-8rem)]">
      <div className="rounded-[22px] border border-line bg-white p-8">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">
          Appel d’offres
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-navy">
          Offre envoyée
        </h1>
        <p className="mt-4 text-[15px] leading-7 text-navy">
          Votre offre a bien été envoyée.
        </p>
        <p className="mt-3 text-[15px] leading-7 text-muted">
          {open
            ? `Vous pouvez encore la modifier jusqu’à la date d’échéance, le ${formatDeadline(row.tender.deadline)}.`
            : "La date d’échéance est passée. L’offre ne peut plus être modifiée."}
        </p>
        <p className="mt-3 text-[15px] leading-7 text-muted">
          Nous vous remercions d’avoir participé à l’appel d’offres.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {open ? (
            <Link
              href={`/espace/appels-doffres/${id}`}
              className="inline-flex h-12 items-center rounded-full bg-logo px-7 text-[15px] font-semibold text-white"
            >
              Modifier l’offre
            </Link>
          ) : null}
          <Link
            href="/espace/appels-doffres"
            className="inline-flex h-12 items-center rounded-full border border-line px-6 text-[15px] font-semibold text-navy"
          >
            Retour aux appels d’offres
          </Link>
        </div>
      </div>
    </div>
  );
}
