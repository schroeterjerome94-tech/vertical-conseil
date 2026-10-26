"use server";

import { revalidatePath } from "next/cache";
import { saveRequestPurchaseOrder } from "@/lib/purchase-order";
import { createClientRequest } from "@/lib/requests";
import {
  formatBuildingAddress,
  formatRequestMessage,
  isRequestKind,
} from "@/lib/requests-ui";
import { requireGerance } from "@/lib/session";

export type RequestState = { ok: boolean; error?: string };

export async function sendClientRequest(
  _prev: RequestState,
  formData: FormData,
): Promise<RequestState> {
  const { user } = await requireGerance();
  const kindRaw = String(formData.get("kind") ?? "");
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const street = String(formData.get("street") ?? "").trim();
  const number = String(formData.get("number") ?? "").trim();
  const npa = String(formData.get("npa") ?? "").trim();
  const locality = String(formData.get("locality") ?? "").trim();
  const owner = String(formData.get("owner") ?? "").trim();
  const access = String(formData.get("access") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const accepted = formData.get("acceptConditions") === "oui";
  if (!isRequestKind(kindRaw)) {
    return { ok: false, error: "Type de demande invalide." };
  }
  if (!firstName || !lastName || !email.includes("@")) {
    return {
      ok: false,
      error: "Merci d’indiquer le prénom, le nom et l’adresse e-mail.",
    };
  }
  if (!street || !number || !npa || !locality || !owner || !access) {
    return { ok: false, error: "Merci de remplir tous les champs." };
  }
  if (!accepted) {
    return {
      ok: false,
      error: "Veuillez accepter les conditions pour envoyer la demande.",
    };
  }
  const address = formatBuildingAddress(street, number, npa, locality);
  const result = await createClientRequest({
    userId: user.id,
    kind: kindRaw,
    message: formatRequestMessage(address, access, {
      firstName,
      lastName,
      email,
      owner,
      message,
    }),
  });
  if (!result.ok) return result;
  revalidatePath("/espace");
  revalidatePath("/espace", "layout");
  revalidatePath("/espace/demandes");
  revalidatePath("/espace/admin/demandes");
  return { ok: true };
}

export async function sendPurchaseOrder(
  _prev: RequestState,
  formData: FormData,
): Promise<RequestState> {
  const { user } = await requireGerance();
  const kindRaw = String(formData.get("kind") ?? "");
  const message = String(formData.get("message") ?? "").trim();
  const accepted = formData.get("acceptConditions") === "oui";
  const file = formData.get("purchaseOrder");
  if (!isRequestKind(kindRaw)) {
    return { ok: false, error: "Type de demande invalide." };
  }
  if (!(file instanceof File) || file.size <= 0) {
    return { ok: false, error: "Joignez le bon de commande." };
  }
  if (!accepted) {
    return {
      ok: false,
      error: "Veuillez accepter les conditions pour envoyer le bon.",
    };
  }
  const lines = [];
  if (user.organizationName?.trim()) {
    lines.push(`Société : ${user.organizationName.trim()}`);
  }
  lines.push(`Bon de commande joint : ${file.name}`);
  if (message) lines.push(`Message : ${message}`);
  const result = await createClientRequest({
    userId: user.id,
    kind: kindRaw,
    message: lines.join("\n"),
  });
  if (!result.ok) return result;
  const saved = await saveRequestPurchaseOrder(result.id, file);
  if (!saved.ok) return saved;
  revalidatePath("/espace");
  revalidatePath("/espace", "layout");
  revalidatePath("/espace/demandes");
  revalidatePath("/espace/admin/demandes");
  return { ok: true };
}
