import { notFound } from "next/navigation";
import {
  displayAddress,
  displayReference,
  getInstallationById,
} from "@/lib/installations";
import { listAscensoristeAccounts } from "@/lib/tenders";
import { requireAdmin } from "@/lib/session";
import { createTenderAction } from "../actions";

export default async function NewTenderPage({
  searchParams,
}: {
  searchParams: Promise<{ installationId?: string }>;
}) {
  await requireAdmin();
  const { installationId } = await searchParams;
  if (!installationId) notFound();
  const installation = await getInstallationById(installationId);
  if (!installation) notFound();
  const companies = await listAscensoristeAccounts();
  const address = displayAddress(installation);
  const reference = displayReference(installation);

  return (
    <div className="max-w-3xl">
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">
        Appels d’offres
      </p>
      <h1 className="mt-2 text-3xl font-semibold text-navy">
        Nouvelle consultation
      </h1>
      <p className="mt-2 text-[15px] text-muted">
        Invitez les entreprises concernées pour cette installation.
      </p>

      <form action={createTenderAction} className="mt-8 grid gap-6">
        <section className="rounded-2xl border border-line bg-white p-6">
          <input type="hidden" name="installationId" value={installation.id} />
          <input type="hidden" name="title" value={address} />
          <div>
            <p className="text-[14px] font-semibold text-navy">Installation</p>
            <p className="mt-2 text-[16px] font-semibold text-navy">{address}</p>
            {reference ? (
              <p className="mt-1 text-[15px] text-muted">{reference}</p>
            ) : null}
          </div>
          <label className="mt-4 grid gap-2 text-[14px] font-semibold text-navy">
            Date limite de retour des offres
            <input
              type="date"
              name="deadline"
              required
              className="h-11 rounded-2xl border border-line px-4 text-[15px] font-normal outline-none focus:border-brand"
            />
          </label>
        </section>

        <section className="rounded-2xl border border-line bg-white p-6">
          <h2 className="text-lg font-semibold text-navy">
            Entreprises invitées
          </h2>
          <p className="mt-1 text-[14px] text-muted">
            Un e-mail de notification est généré pour chaque invitation.
          </p>
          <div className="mt-4 grid gap-2">
            {companies.length ? (
              companies.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl border border-line px-4 py-3 text-[14px]"
                >
                  <input type="checkbox" name="inviteeIds" value={item.id} />
                  <span>
                    <span className="font-semibold text-navy">
                      {item.organizationName?.trim() || item.name}
                    </span>
                    <span className="block text-[13px] text-muted">
                      {item.email}
                    </span>
                  </span>
                </label>
              ))
            ) : (
              <p className="text-[14px] text-muted">
                Aucun compte ascensoriste approuvé pour le moment.
              </p>
            )}
          </div>
        </section>

        <button
          type="submit"
          disabled={!companies.length}
          className="inline-flex h-12 w-fit items-center rounded-full bg-logo px-7 text-[15px] font-semibold text-white disabled:opacity-40"
        >
          Lancer l’appel d’offres
        </button>
      </form>
    </div>
  );
}
