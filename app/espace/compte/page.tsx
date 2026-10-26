import { changePasswordAction, updateProfileAction } from "./actions";
import { PasswordForm } from "./password-form";
import { requireUser } from "@/lib/session";

export default async function AccountPage() {
  const { user } = await requireUser();
  const parts = user.name.trim().split(/\s+/);
  const firstName = user.firstName || parts[0] || "";
  const lastName = user.lastName || parts.slice(1).join(" ");

  return (
    <div className="max-w-xl">
      <h1 className="text-3xl font-semibold text-navy">Compte</h1>
      <p className="mt-2 text-[15px] text-muted">{user.email}</p>

      <form action={updateProfileAction} className="mt-8 grid gap-4 rounded-2xl border border-line bg-white p-6">
        <h2 className="text-lg font-semibold text-navy">Profil</h2>
        <label className="grid gap-2 text-[14px] font-semibold text-navy">
          Prénom
          <input
            name="firstName"
            required
            defaultValue={firstName}
            className="h-11 rounded-2xl border border-line px-4 text-[15px] font-normal outline-none focus:border-brand"
          />
        </label>
        <label className="grid gap-2 text-[14px] font-semibold text-navy">
          Nom
          <input
            name="lastName"
            required
            defaultValue={lastName}
            className="h-11 rounded-2xl border border-line px-4 text-[15px] font-normal outline-none focus:border-brand"
          />
        </label>
        <label className="grid gap-2 text-[14px] font-semibold text-navy">
          Téléphone
          <input
            type="tel"
            name="phone"
            required
            defaultValue={user.phone ?? ""}
            className="h-11 rounded-2xl border border-line px-4 text-[15px] font-normal outline-none focus:border-brand"
          />
        </label>
        <label className="grid gap-2 text-[14px] font-semibold text-navy">
          Adresse
          <textarea
            name="address"
            required
            defaultValue={user.address ?? ""}
            className="min-h-24 rounded-2xl border border-line px-4 py-3 text-[15px] font-normal outline-none focus:border-brand"
          />
        </label>
        <label className="grid gap-2 text-[14px] font-semibold text-navy">
          Organisation
          <input
            name="organizationName"
            defaultValue={user.organizationName ?? ""}
            className="h-11 rounded-2xl border border-line px-4 text-[15px] font-normal outline-none focus:border-brand"
          />
        </label>
        <button
          type="submit"
          className="inline-flex h-11 w-fit items-center rounded-full bg-logo px-6 text-[14px] font-semibold text-white"
        >
          Enregistrer
        </button>
      </form>

      <div className="mt-6 rounded-2xl border border-line bg-white p-6">
        <h2 className="text-lg font-semibold text-navy">Mot de passe</h2>
        <PasswordForm action={changePasswordAction} />
      </div>
    </div>
  );
}
