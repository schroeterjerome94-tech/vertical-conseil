import Link from "next/link";
import { GeranceDashboard } from "@/components/app/GeranceDashboard";
import { displayTitle, listInstallationsForUser } from "@/lib/installations";
import { listRequestsForUser } from "@/lib/requests";
import { requestAddressFromMessage } from "@/lib/requests-ui";
import { requireUser } from "@/lib/session";

export default async function EspacePage() {
  const { user } = await requireUser();
  const greeting =
    user.role === "gerance"
      ? user.organizationName?.trim() || "gérance"
      : user.firstName?.trim() || user.name.trim().split(/\s+/)[0] || user.name;

  if (user.role === "gerance") {
    const [installations, requests] = await Promise.all([
      listInstallationsForUser({ role: "gerance", userId: user.id }),
      listRequestsForUser(user.id),
    ]);
    return (
      <GeranceDashboard
        firstName={greeting}
        installations={installations.slice(0, 4).map((item) => ({
          id: item.id,
          address: item.buildingAddress || "",
          title: item.internalRef || "",
        }))}
        requests={requests.slice(0, 4).map(({ request, installation }) => ({
          id: request.id,
          kind: request.kind,
          status: request.status,
          createdAt: request.createdAt,
          installation:
            requestAddressFromMessage(request.message) ||
            installation?.buildingAddress ||
            (installation ? displayTitle(installation) : null),
        }))}
      />
    );
  }

  const kicker =
    user.role === "admin" ? "Espace administration" : "Espace ascensoriste";
  const intro =
    user.role === "admin"
      ? "Validez les inscriptions, gérez les fiches et lancez les appels d’offres."
      : "Consultez les cahiers des charges et suivez vos soumissions.";
  const actions =
    user.role === "admin"
      ? [
          {
            href: "/espace/admin/inscriptions",
            label: "Inscriptions",
            text: "Valider les nouveaux comptes.",
          },
          {
            href: "/espace/admin/installations",
            label: "Installations",
            text: "Fiches, documents et attributions.",
          },
          {
            href: "/espace/admin/appels-doffres",
            label: "Appels d’offres",
            text: "Lancer et suivre les consultations.",
          },
          {
            href: "/espace/admin/demandes",
            label: "Demandes",
            text: "Demandes envoyées par les gérances.",
          },
        ]
      : [
          {
            href: "/espace/appels-doffres",
            label: "Appels d’offres",
            text: "Consultations auxquelles vous êtes invité.",
          },
          {
            href: "/espace/formule",
            label: "Formule",
            text: "Tarif par cahier des charges, facture à 30 jours.",
          },
        ];

  return (
    <div className="max-w-5xl">
      <section className="overflow-hidden rounded-[28px] bg-navy px-6 py-8 text-white sm:px-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/55">
          {kicker}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Bonjour {greeting}
        </h1>
        <p className="mt-2 max-w-xl text-[15px] leading-7 text-white/75">
          {intro}
        </p>
      </section>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {actions.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-2xl border border-line bg-white p-5 transition hover:border-brand/40 hover:shadow-[0_16px_40px_rgba(7,29,68,0.06)]"
          >
            <h2 className="text-[16px] font-semibold text-navy">{item.label}</h2>
            <p className="mt-1 text-[14px] leading-6 text-muted">{item.text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
