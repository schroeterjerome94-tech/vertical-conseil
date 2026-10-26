import { desc } from "drizzle-orm";
import { AdminInscriptionRow } from "@/components/app/AdminInscriptionRow";
import { ListFilters, UPDATED_SORT_FILTER } from "@/components/app/ListFilters";
import { setAccountStatus, setPlanAction } from "../actions";
import { dateSortDirection } from "@/lib/list-sort";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/session";


function StatusForm({
  userId,
  status,
  label,
}: {
  userId: string;
  status: "approved" | "refused" | "suspended";
  label: string;
}) {
  return (
    <form
      action={async () => {
        "use server";
        await setAccountStatus(userId, status);
      }}
    >
      <button
        type="submit"
        className="rounded-full border border-line px-3 py-1.5 text-[13px] font-semibold text-navy hover:border-brand"
      >
        {label}
      </button>
    </form>
  );
}

function PlanForm({
  userId,
  plan,
  label,
  emphasis = false,
}: {
  userId: string;
  plan: "free" | "pro";
  label: string;
  emphasis?: boolean;
}) {
  return (
    <form
      action={async () => {
        "use server";
        await setPlanAction(userId, plan);
      }}
    >
      <button
        type="submit"
        className={
          emphasis
            ? "rounded-full bg-logo px-3 py-1.5 text-[13px] font-semibold text-white"
            : "rounded-full border border-line px-3 py-1.5 text-[13px] font-semibold text-navy hover:border-brand"
        }
      >
        {label}
      </button>
    </form>
  );
}

function asList(value?: string | string[]) {
  return (Array.isArray(value) ? value : value ? [value] : []).filter(Boolean);
}

export default async function InscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    profil?: string | string[];
    statut?: string | string[];
    formule?: string | string[];
    tri?: string | string[];
  }>;
}) {
  await requireAdmin();
  const { q, profil, statut, formule, tri } = await searchParams;
  const profiles = asList(profil);
  const statuses = asList(statut);
  const plans = asList(formule);
  const direction = dateSortDirection(tri);
  const query = q?.trim().toLowerCase() ?? "";
  const users = (
    await db
      .select()
      .from(user)
      .orderBy(desc(user.planRequested), desc(user.createdAt))
  )
    .filter((item) => {
      if (profiles.length && !profiles.includes(item.role)) return false;
      if (statuses.length && !statuses.includes(item.status)) return false;
      if (plans.length) {
        const planKey = item.planRequested
          ? "requested"
          : item.plan === "pro"
            ? "pro"
            : "free";
        if (!plans.includes(planKey)) return false;
      }
      if (!query) return true;
      return [item.name, item.email, item.organizationName, item.phone, item.address]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    })
    .sort(
      (a, b) =>
        (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) *
        direction,
    );

  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl font-semibold text-navy">Inscriptions</h1>
      <p className="mt-2 text-[15px] text-muted">
        Validez les comptes et activez ou retirez l’abonnement Pro des
        gérances. La version Pro ascensoriste se débloque par facture sur
        chaque cahier des charges. Les administrateurs Vertical Conseil sont
        déjà actifs.
      </p>
      <ListFilters
        q={q}
        placeholder="Recherche par nom, e-mail ou entreprise…"
        groups={[
          {
            name: "profil",
            label: "Profil",
            options: [
              { value: "gerance", label: "Gérance" },
              { value: "ascensoriste", label: "Ascensoriste" },
            ],
          },
          {
            name: "statut",
            label: "Statut",
            options: [
              { value: "pending", label: "En attente" },
              { value: "approved", label: "Validé" },
              { value: "refused", label: "Refusé" },
              { value: "suspended", label: "Suspendu" },
            ],
          },
          {
            name: "formule",
            label: "Formule",
            options: [
              { value: "free", label: "Gratuite" },
              { value: "pro", label: "Pro" },
              { value: "requested", label: "Demande Pro" },
            ],
          },
          UPDATED_SORT_FILTER,
        ]}
        selected={{ profil, statut, formule, tri }}
      />
      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[640px] text-left text-[14px]">
          <thead className="border-b border-line bg-soft text-[12px] uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Nom</th>
              <th className="px-4 py-3 font-semibold">E-mail</th>
              <th className="px-4 py-3 font-semibold">Profil</th>
              <th className="px-4 py-3 font-semibold">Statut</th>
              <th className="px-4 py-3 font-semibold">Formule</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((item) => (
              <AdminInscriptionRow
                key={item.id}
                userId={item.id}
                canDelete={item.role !== "admin"}
              >
                <td className="px-4 py-3 font-semibold text-navy">
                  {item.name}
                  {item.organizationName ? (
                    <span className="block text-[12px] font-normal text-muted">
                      {item.organizationName}
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-muted">
                  {item.email}
                  {item.phone ? (
                    <span className="block text-[12px]">{item.phone}</span>
                  ) : null}
                  {item.address ? (
                    <span className="mt-1 block whitespace-pre-wrap text-[12px]">
                      {item.address}
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3 capitalize">{item.role}</td>
                <td className="px-4 py-3">{item.status}</td>
                <td className="px-4 py-3">
                  {item.role === "admin" ? (
                    <span className="text-[12px] text-muted">—</span>
                  ) : (
                    <>
                      {item.role === "ascensoriste"
                        ? "Par cahier des charges"
                        : item.plan === "pro"
                          ? "Pro"
                          : "Gratuite"}
                      {item.role === "gerance" && item.planRequested ? (
                        <span className="block text-[12px] font-semibold text-logo">
                          Demande Pro
                        </span>
                      ) : null}
                    </>
                  )}
                </td>
                <td className="px-4 py-3">
                  {item.role === "admin" ? (
                    <span className="text-[12px] text-muted">Admin</span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {item.status === "pending" ? (
                        <>
                          <StatusForm
                            userId={item.id}
                            status="approved"
                            label="Valider"
                          />
                          <StatusForm
                            userId={item.id}
                            status="refused"
                            label="Refuser"
                          />
                        </>
                      ) : null}
                      {item.status === "approved" ? (
                        <>
                          <StatusForm
                            userId={item.id}
                            status="suspended"
                            label="Suspendre"
                          />
                          {item.role === "gerance" ? (
                            item.plan !== "pro" ? (
                              <PlanForm
                                userId={item.id}
                                plan="pro"
                                label={
                                  item.planRequested
                                    ? "Activer la demande Pro"
                                    : "Activer Pro"
                                }
                                emphasis={item.planRequested}
                              />
                            ) : (
                              <PlanForm
                                userId={item.id}
                                plan="free"
                                label="Repasser en gratuit"
                              />
                            )
                          ) : (
                            <span className="text-[12px] text-muted">
                              Facture par cahier des charges
                            </span>
                          )}
                        </>
                      ) : null}
                      {item.status === "refused" || item.status === "suspended" ? (
                        <StatusForm
                          userId={item.id}
                          status="approved"
                          label="Valider"
                        />
                      ) : null}
                    </div>
                  )}
                </td>
              </AdminInscriptionRow>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
