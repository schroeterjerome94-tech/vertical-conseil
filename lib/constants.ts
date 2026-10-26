export const ADMIN_EMAILS = [
  "michel.gosteli@vertical-conseil.ch",
  "jerome.schroeter@vertical-conseil.ch",
] as const;

export const INFO_EMAIL = "info@vertical-conseil.ch";

export const COMPANY = {
  name: "Vertical Conseil Sàrl",
  street: "Rue du Molage 10b",
  city: "1860 Aigle",
} as const;

export type AccountKind = "gerance" | "ascensoriste";
export type UserRole = "admin" | AccountKind;
export type AccountStatus = "pending" | "approved" | "refused" | "suspended";
export type AccountPlan = "free" | "pro";

export const PRO_YEARLY_PRICE = "2 560.00 CHF";
export const PRO_YEARLY_PERIOD = "par année";

export function isAdminEmail(email: string) {
  return ADMIN_EMAILS.includes(
    email.trim().toLowerCase() as (typeof ADMIN_EMAILS)[number],
  );
}
