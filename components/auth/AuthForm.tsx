"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

const fieldClass =
  "h-12 w-full rounded-2xl border border-line px-4 text-[15px] font-normal outline-none transition focus:border-brand";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setError("");
    setPending(true);
    const { error: result } = await authClient.signIn.email({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });
    setPending(false);
    if (result) {
      setError(result.message || "Connexion impossible.");
      return;
    }
    router.replace("/espace");
  }

  return (
    <form action={onSubmit} className="mt-5 grid gap-3">
      {error ? (
        <p className="text-[14px] font-semibold text-red-600">{error}</p>
      ) : null}
      <label className="grid gap-2 text-[13px] font-semibold text-navy">
        E-mail
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="votre.email@exemple.ch"
          className={fieldClass}
        />
      </label>
      <label className="grid gap-2 text-[13px] font-semibold text-navy">
        Mot de passe
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className={fieldClass}
        />
      </label>
      <p className="text-[13px]">
        <Link href="/mot-de-passe-oublie" className="font-semibold text-logo">
          Mot de passe oublié ?
        </Link>
      </p>
      <button
        type="submit"
        disabled={pending}
        className="mt-1 inline-flex h-11 items-center justify-center rounded-full bg-logo text-[14px] font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setError("");
    setPending(true);
    const firstName = String(formData.get("firstName") ?? "").trim();
    const lastName = String(formData.get("lastName") ?? "").trim();
    const { error: result } = await authClient.signUp.email({
      name: `${firstName} ${lastName}`.trim(),
      firstName,
      lastName,
      phone: String(formData.get("phone") ?? "").trim(),
      address: String(formData.get("address") ?? "").trim(),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      organizationName: String(formData.get("organizationName") ?? ""),
      accountKind: String(formData.get("accountKind") ?? "gerance"),
      callbackURL: "/inscription/confirmation",
    });
    setPending(false);
    if (result) {
      setError(result.message || "Inscription impossible.");
      return;
    }
    router.push("/inscription/confirmation");
  }

  return (
    <form action={onSubmit} className="mt-5 grid gap-3">
      {error ? (
        <p className="text-[14px] font-semibold text-red-600">{error}</p>
      ) : null}
      <label className="grid gap-2 text-[13px] font-semibold text-navy">
        Profil
        <select name="accountKind" required className={fieldClass}>
          <option value="gerance">Gérance / propriétaire</option>
          <option value="ascensoriste">Entreprise d’ascenseurs</option>
        </select>
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2 text-[13px] font-semibold text-navy">
          Prénom
          <input
            name="firstName"
            required
            autoComplete="given-name"
            placeholder="Prénom"
            className={fieldClass}
          />
        </label>
        <label className="grid gap-2 text-[13px] font-semibold text-navy">
          Nom
          <input
            name="lastName"
            required
            autoComplete="family-name"
            placeholder="Nom"
            className={fieldClass}
          />
        </label>
      </div>
      <label className="grid gap-2 text-[13px] font-semibold text-navy">
        Téléphone
        <input
          type="tel"
          name="phone"
          required
          autoComplete="tel"
          placeholder="+41 21 000 00 00"
          className={fieldClass}
        />
      </label>
      <label className="grid gap-2 text-[13px] font-semibold text-navy">
        Adresse
        <textarea
          name="address"
          required
          autoComplete="street-address"
          placeholder="Rue, numéro, NPA, localité"
          className="min-h-24 w-full rounded-2xl border border-line px-4 py-3 text-[15px] font-normal outline-none transition focus:border-brand"
        />
      </label>
      <label className="grid gap-2 text-[13px] font-semibold text-navy">
        Société
        <input
          name="organizationName"
          required
          placeholder="Nom de la société"
          className={fieldClass}
        />
      </label>
      <label className="grid gap-2 text-[13px] font-semibold text-navy">
        E-mail
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="votre.email@exemple.ch"
          className={fieldClass}
        />
      </label>
      <label className="grid gap-2 text-[13px] font-semibold text-navy">
        Mot de passe
        <input
          type="password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="8 caractères minimum"
          className={fieldClass}
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="mt-1 inline-flex h-11 items-center justify-center rounded-full bg-logo text-[14px] font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Envoi…" : "Créer le compte"}
      </button>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setError("");
    setMessage("");
    setPending(true);
    const { error: result } = await authClient.requestPasswordReset({
      email: String(formData.get("email") ?? ""),
      redirectTo: "/reinitialiser-mot-de-passe",
    });
    setPending(false);
    if (result) {
      setError(result.message || "Demande impossible.");
      return;
    }
    setMessage(
      "Si un compte existe, un lien de réinitialisation a été préparé. En local, ouvrez /inscription/confirmation.",
    );
  }

  return (
    <form action={onSubmit} className="mt-8 grid gap-4">
      {error ? (
        <p className="text-[14px] font-semibold text-red-600">{error}</p>
      ) : null}
      {message ? (
        <p className="text-[14px] font-semibold text-green">{message}</p>
      ) : null}
      <label className="grid gap-2 text-[13px] font-semibold text-navy">
        E-mail
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className={fieldClass}
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 items-center justify-center rounded-full bg-logo text-[15px] font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Envoi…" : "Envoyer le lien"}
      </button>
    </form>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setError("");
    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirm") ?? "");
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setPending(true);
    const { error: result } = await authClient.resetPassword({
      newPassword: password,
    });
    setPending(false);
    if (result) {
      setError(result.message || "Réinitialisation impossible.");
      return;
    }
    router.push("/connexion");
  }

  return (
    <form action={onSubmit} className="mt-8 grid gap-4">
      {error ? (
        <p className="text-[14px] font-semibold text-red-600">{error}</p>
      ) : null}
      <label className="grid gap-2 text-[13px] font-semibold text-navy">
        Nouveau mot de passe
        <input
          type="password"
          name="password"
          required
          minLength={8}
          className={fieldClass}
        />
      </label>
      <label className="grid gap-2 text-[13px] font-semibold text-navy">
        Confirmation
        <input
          type="password"
          name="confirm"
          required
          minLength={8}
          className={fieldClass}
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 items-center justify-center rounded-full bg-logo text-[15px] font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
