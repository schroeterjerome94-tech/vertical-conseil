export const REQUEST_KINDS = ["tender", "audit", "repair", "other"] as const;
export type RequestKind = (typeof REQUEST_KINDS)[number];

export const REQUEST_KIND_LABEL: Record<RequestKind, string> = {
  tender: "Appel d’offres",
  audit: "Audit",
  repair: "Réparation",
  other: "Question",
};

export const REQUEST_KIND_TEXT: Record<RequestKind, string> = {
  tender:
    "Demander une consultation pour le remplacement ou la modernisation de l’ascenseur.",
  audit: "Demander un contrôle ou un audit de l’installation.",
  repair: "Signaler une panne ou un besoin de réparation.",
  other: "Poser une question ou formuler une autre demande.",
};

export const REQUEST_KIND_STEPS: Record<RequestKind, string[]> = {
  tender: [
    "Vous transmettez l’adresse de l’immeuble et les indications d’accès.",
    "Nous effectuons la visite et le relevé de l’installation, puis nous prenons contact afin de vous donner les possibilités selon les normes en vigueur et vos désirs.",
    "Nous rédigeons le cahier des charges, pour un remplacement ou une modernisation.",
    "Nous lançons l’appel d’offres auprès d’ascensoristes.",
    "Nous comparons les offres reçues et vous accompagnons jusqu’au choix.",
  ],
  audit: [
    "Vous transmettez l’adresse de l’immeuble et les indications d’accès.",
    "Nous vous recontactons pour convenir d’une visite.",
    "Nous contrôlons l’installation et établissons un rapport d’audit.",
  ],
  repair: [
    "Vous transmettez l’adresse de l’immeuble et les indications d’accès.",
    "Nous vous recontactons pour préciser le besoin.",
    "Nous vous orientons et, si nécessaire, organisons le suivi de l’intervention.",
  ],
  other: [
    "Vous transmettez l’adresse de l’immeuble et les indications d’accès.",
    "Nous vous recontactons pour répondre à votre demande.",
  ],
};

export const REQUEST_KIND_FEES: Record<RequestKind, string> = {
  tender:
    "Cette prestation donne lieu à des honoraires, facturés par Vertical Conseil (visite et relevé, cahier des charges et suivi de l’appel d’offres). Le montant vous est communiqué avant engagement.",
  audit:
    "Cette prestation donne lieu à des honoraires, facturés par Vertical Conseil. Le montant vous est communiqué avant engagement.",
  repair:
    "Cette prestation donne lieu à des honoraires, facturés par Vertical Conseil. Le montant vous est communiqué avant engagement.",
  other:
    "Selon la nature de la demande, des honoraires peuvent être facturés. Le cas échéant, le montant vous est communiqué avant engagement.",
};

export function isRequestKind(value: string): value is RequestKind {
  return (REQUEST_KINDS as readonly string[]).includes(value);
}

export function formatBuildingAddress(
  street: string,
  number: string,
  npa: string,
  locality: string,
) {
  return `${street} ${number}, ${npa} ${locality}`.replace(/\s+/g, " ").trim();
}

export function formatRequestMessage(
  address: string,
  access: string,
  extras?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    owner?: string;
    message?: string;
  },
) {
  const requester = [extras?.firstName, extras?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  const lines = [];
  if (requester) lines.push(`Demandeur : ${requester}`);
  if (extras?.email) lines.push(`E-mail : ${extras.email}`);
  lines.push(`Adresse de l’immeuble : ${address}`);
  if (extras?.owner) lines.push(`Propriétaire : ${extras.owner}`);
  lines.push(`Accès au bâtiment : ${access}`);
  if (extras?.message) lines.push(`Message : ${extras.message}`);
  return lines.join("\n");
}

export function requestAddressFromMessage(message: string) {
  return requestDetailsFromMessage(message).address;
}

export function requestDetailsFromMessage(message: string) {
  function line(label: string) {
    const match = message.match(new RegExp(`^${label} : (.+)$`, "m"));
    return match?.[1]?.trim() || "";
  }
  const accessMatch = message.match(
    /^Accès au bâtiment : ([\s\S]*?)(?=\n(?:Message|Bon de commande joint|Propriétaire) : |\s*$)/m,
  );
  return {
    organization: line("Société"),
    requester: line("Demandeur"),
    email: line("E-mail"),
    address: line("Adresse de l’immeuble"),
    owner: line("Propriétaire"),
    access: accessMatch?.[1]?.trim() || line("Accès au bâtiment"),
    note: line("Message"),
  };
}

export function displayRequestMessage(message: string) {
  return message
    .split("\n")
    .filter((line) => !/^Société\s*:/i.test(line.trim()))
    .join("\n")
    .trim();
}

export function accountCompanyName(account: {
  organizationName?: string | null;
  name?: string | null;
}) {
  return account.organizationName?.trim() || account.name?.trim() || "";
}
