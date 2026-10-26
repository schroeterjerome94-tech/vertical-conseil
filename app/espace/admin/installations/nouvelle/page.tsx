import { InstallationForm } from "@/components/app/InstallationForm";
import { createInstallation } from "../actions";
import { listGeranceAccounts, nextInternalRef } from "@/lib/installations";
import { getClientRequestById } from "@/lib/requests";
import { requestDetailsFromMessage } from "@/lib/requests-ui";
import { requireAdmin } from "@/lib/session";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function NewInstallationPage({
  searchParams,
}: {
  searchParams: Promise<{ demande?: string }>;
}) {
  await requireAdmin();
  const { demande } = await searchParams;
  const [gerances, internalRef] = await Promise.all([
    listGeranceAccounts(),
    nextInternalRef(),
  ]);

  const values: Record<string, string> = { internalRef };
  let selectedIds: string[] = [];
  let fromRequest: {
    requester: string;
    email: string;
    note: string;
    hasBon: boolean;
  } | null = null;

  if (demande) {
    const request = await getClientRequestById(demande);
    if (request) {
      const details = requestDetailsFromMessage(request.message);
      const [account] = await db
        .select({
          organizationName: user.organizationName,
        })
        .from(user)
        .where(eq(user.id, request.userId))
        .limit(1);
      values.requestId = request.id;
      values.buildingAddress = details.address;
      values.ownerName = details.owner;
      values.buildingAccess = details.access;
      values.propertyManagerName =
        details.organization || account?.organizationName || "";
      selectedIds = [request.userId];
      fromRequest = {
        requester: details.requester,
        email: details.email,
        note: details.note,
        hasBon: Boolean(request.purchaseOrderStored),
      };
    }
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-semibold text-navy">Nouvelle installation</h1>
      <p className="mt-2 text-[15px] text-muted">
        {fromRequest
          ? "Les informations déjà connues de la demande ont été reprises. Complétez le reste de la fiche."
          : "Renseignez les informations générales et techniques existantes. Les photos, l’audit, le cahier des charges, la réparation et la maintenance se font ensuite sur la fiche."}
      </p>
      {fromRequest &&
      (fromRequest.requester || fromRequest.email || fromRequest.note || fromRequest.hasBon) ? (
        <div className="mt-6 rounded-2xl border border-line bg-white p-5 text-[15px] leading-7 text-navy">
          {fromRequest.requester ? (
            <p>
              Demandeur :{" "}
              <span className="font-semibold">{fromRequest.requester}</span>
            </p>
          ) : null}
          {fromRequest.email ? <p>E-mail : {fromRequest.email}</p> : null}
          {fromRequest.note ? <p>Message : {fromRequest.note}</p> : null}
          {fromRequest.hasBon ? (
            <p>
              <a
                href={`/espace/demandes/bon/${values.requestId}`}
                className="font-semibold text-logo"
              >
                Voir le bon de commande
              </a>
            </p>
          ) : null}
        </div>
      ) : null}
      <div className="mt-8">
        <InstallationForm
          action={createInstallation}
          values={values}
          gerances={gerances}
          selectedIds={selectedIds}
          submitLabel="Enregistrer"
        />
      </div>
    </div>
  );
}
