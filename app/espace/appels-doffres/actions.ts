"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  isOfferComplete,
  parseProposal,
  parseProposalForm,
} from "@/lib/offer-proposal";
import { keepMoney } from "@/lib/money";
import { parseExtraFields } from "@/lib/norms";
import {
  getOwnOffer,
  getTenderById,
  isTenderOpen,
  upsertOffer,
  userCanViewTender,
} from "@/lib/tenders";
import { purchaseAsceProForTender } from "@/lib/asce-pro";
import { requireAscensoriste } from "@/lib/session";

async function saveOffer(tenderId: string, formData: FormData, requireAmount: boolean) {
  const { user } = await requireAscensoriste();
  const allowed = await userCanViewTender(user.role, user.id, tenderId);
  if (!allowed) redirect("/espace/appels-doffres");
  const row = await getTenderById(tenderId);
  if (!row || !isTenderOpen(row.tender)) {
    throw new Error("Cet appel d’offres n’accepte plus de soumissions.");
  }
  const amount = keepMoney(String(formData.get("amount") ?? "").trim());
  const clauses =
    parseExtraFields(row.installation.extraFields).specification?.selectedClauses;
  const values = JSON.parse(parseProposalForm(formData)) as ReturnType<
    typeof parseProposal
  >;
  const complete = isOfferComplete(amount, values, clauses);
  const confirmed = formData.get("confirmIndications") === "oui";
  const existing = await getOwnOffer(tenderId, user.id);
  values.acknowledged = requireAmount
    ? complete && confirmed
      ? "oui"
      : ""
    : parseProposal(existing?.proposal).acknowledged ?? "";
  const proposal = JSON.stringify(values);
  await upsertOffer({
    tenderId,
    userId: user.id,
    amount,
    message: null,
    proposal,
  });
  revalidatePath(`/espace/appels-doffres/${tenderId}`);
  revalidatePath(`/espace/appels-doffres/${tenderId}/envoyee`);
  revalidatePath("/espace/appels-doffres");
  if (requireAmount && !complete) {
    redirect(`/espace/appels-doffres/${tenderId}?incomplet=1`);
  }
  if (requireAmount && !confirmed) {
    redirect(`/espace/appels-doffres/${tenderId}?confirm=1`);
  }
  if (requireAmount) {
    redirect(`/espace/appels-doffres/${tenderId}/envoyee`);
  }
}

export async function saveOfferDraftAction(tenderId: string, formData: FormData) {
  await saveOffer(tenderId, formData, false);
}

export async function submitOfferAction(tenderId: string, formData: FormData) {
  await saveOffer(tenderId, formData, true);
}

export async function unlockAsceProAction(tenderId: string) {
  const { user } = await requireAscensoriste();
  const result = await purchaseAsceProForTender({
    userId: user.id,
    name: user.name,
    email: user.email,
    tenderId,
  });
  revalidatePath(`/espace/appels-doffres/${tenderId}`);
  revalidatePath("/espace/appels-doffres");
  revalidatePath("/espace/notifications");
  revalidatePath("/espace", "layout");
  if (!result.ok) redirect("/espace/appels-doffres");
  redirect(
    `/espace/appels-doffres/${tenderId}?onglet=cahier&facture=${result.already ? "deja" : "1"}`,
  );
}
