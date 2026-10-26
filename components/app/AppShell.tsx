import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { SignOutButton } from "./SignOutButton";
import type { UserRole } from "@/lib/constants";

const NAV: Record<UserRole, { href: string; label: string }[]> = {
  admin: [
    { href: "/espace", label: "Tableau de bord" },
    { href: "/espace/admin/inscriptions", label: "Inscriptions" },
    { href: "/espace/admin/installations", label: "Installations" },
    { href: "/espace/admin/appels-doffres", label: "Appels d’offres" },
    { href: "/espace/admin/demandes", label: "Demandes" },
    { href: "/espace/compte", label: "Compte" },
  ],
  gerance: [
    { href: "/espace", label: "Tableau de bord" },
    { href: "/espace/installations", label: "Mes installations" },
    { href: "/espace/appels-doffres", label: "Appels d’offres" },
    { href: "/espace/formule", label: "Formule" },
    { href: "/espace/compte", label: "Compte" },
  ],
  ascensoriste: [
    { href: "/espace", label: "Tableau de bord" },
    { href: "/espace/appels-doffres", label: "Appels d’offres" },
    { href: "/espace/formule", label: "Formule" },
    { href: "/espace/compte", label: "Compte" },
  ],
};

export function AppShell({
  children,
  role,
  name,
  badges,
}: {
  children: ReactNode;
  role: UserRole;
  name: string;
  badges?: Record<string, number>;
}) {
  const items = NAV[role];

  return (
    <div className="min-h-full bg-[#f7f9fc]">
      <div className="mx-auto flex min-h-full max-w-[1400px]">
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col overflow-y-auto border-r border-line bg-white px-5 py-6 print:hidden md:flex">
          <Link href="/espace" className="block px-1">
            <Image
              src="/brand/logo-transparent.png"
              alt="Vertical Conseil"
              width={320}
              height={96}
              className="h-16 w-auto"
              unoptimized
            />
          </Link>
          <nav className="mt-8 grid flex-1 content-start gap-1">
            {items.map((item) => {
              const count = badges?.[item.href] ?? 0;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-[14px] font-semibold text-navy hover:bg-soft"
                >
                  <span className="min-w-0 flex-1">{item.label}</span>
                  {count > 0 ? (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-logo px-1.5 text-[11px] font-semibold text-white">
                      {count}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
          <div className="mt-8 border-t border-line pt-4">
            <p className="px-3 text-[13px] font-semibold text-navy">{name}</p>
            <p className="px-3 text-[12px] capitalize text-muted">{role}</p>
            <div className="mt-3 px-3">
              <SignOutButton />
            </div>
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-[72px] items-center justify-between border-b border-line bg-white px-5 print:hidden md:hidden">
            <Image
              src="/brand/logo-transparent.png"
              alt="Vertical Conseil"
              width={260}
              height={72}
              className="h-12 w-auto"
              unoptimized
            />
            <SignOutButton />
          </header>
          <main className="flex-1 px-5 py-8 sm:px-8 print:px-0 print:py-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
